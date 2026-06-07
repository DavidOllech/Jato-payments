"""JATO backend — JWT auth, transactions, live BRL/USDC rate."""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext
from typing import List, Optional, Literal
from datetime import datetime, timedelta, timezone
from pathlib import Path
import os
import logging
import uuid
import secrets
import asyncio
import httpx
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.environ.get("JWT_EXPIRE_MINUTES", "10080"))
EMAIL_MOCK_MODE = os.environ.get("EMAIL_MOCK_MODE", "true").lower() == "true"
FRONTEND_BASE_URL = os.environ.get("FRONTEND_BASE_URL", "")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("jato")

app = FastAPI(title="JATO API")
api = APIRouter(prefix="/api")

# ------------- Models -------------
class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    account_type: Literal["personal", "business"]
    cpf: Optional[str] = None
    cnpj: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class VerifyEmailRequest(BaseModel):
    token: str


class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr
    account_type: str
    cpf: Optional[str] = None
    cnpj: Optional[str] = None
    email_verified: bool
    usdc_balance: float
    created_at: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
    verification_token: Optional[str] = None  # mock mode only


class TransactionCreate(BaseModel):
    type: Literal["funded", "sent", "card_spend"]
    amount_usdc: float
    amount_brl: Optional[float] = None
    recipient_name: Optional[str] = None
    note: Optional[str] = None
    status: Literal["completed", "pending", "failed"] = "completed"


class TransactionOut(BaseModel):
    id: str
    type: str
    amount_usdc: float
    amount_brl: Optional[float] = None
    recipient_name: Optional[str] = None
    note: Optional[str] = None
    status: str
    created_at: str


class RateResponse(BaseModel):
    usdc_brl: float
    cached: bool
    fetched_at: str


# ------------- Helpers -------------
def hash_pw(p: str) -> str:
    return pwd_ctx.hash(p)


def verify_pw(p: str, h: str) -> bool:
    try:
        return pwd_ctx.verify(p, h)
    except Exception:
        return False


def make_token(sub: str) -> str:
    payload = {
        "sub": sub,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def user_to_public(u: dict) -> UserPublic:
    return UserPublic(
        id=u["id"],
        name=u["name"],
        email=u["email"],
        account_type=u["account_type"],
        cpf=u.get("cpf"),
        cnpj=u.get("cnpj"),
        email_verified=u.get("email_verified", False),
        usdc_balance=u.get("usdc_balance", 0.0),
        created_at=u["created_at"],
    )


async def get_current_user(authorization: Optional[str] = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ------------- Rate cache (5 min) -------------
_rate_cache = {"value": 5.42, "fetched_at": None}
_rate_lock = asyncio.Lock()


async def get_rate() -> RateResponse:
    async with _rate_lock:
        now = datetime.now(timezone.utc)
        cached_ts = _rate_cache["fetched_at"]
        if cached_ts and (now - cached_ts).total_seconds() < 300:
            return RateResponse(
                usdc_brl=_rate_cache["value"],
                cached=True,
                fetched_at=cached_ts.isoformat(),
            )
        try:
            async with httpx.AsyncClient(timeout=8.0) as c:
                r = await c.get(
                    "https://api.coingecko.com/api/v3/simple/price",
                    params={"ids": "usd-coin", "vs_currencies": "brl"},
                )
                r.raise_for_status()
                data = r.json()
                price = float(data["usd-coin"]["brl"])
                _rate_cache["value"] = price
                _rate_cache["fetched_at"] = now
                return RateResponse(
                    usdc_brl=price, cached=False, fetched_at=now.isoformat()
                )
        except Exception as e:
            logger.warning(f"rate fetch failed, using fallback: {e}")
            return RateResponse(
                usdc_brl=_rate_cache["value"],
                cached=True,
                fetched_at=(cached_ts or now).isoformat(),
            )


# ------------- Routes -------------
@api.get("/")
async def root():
    return {"app": "JATO", "tagline": "Send money. De jato."}


@api.get("/rate", response_model=RateResponse)
async def rate():
    return await get_rate()


@api.post("/auth/signup", response_model=AuthResponse, status_code=201)
async def signup(body: SignupRequest):
    email = body.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    if body.account_type == "personal" and not body.cpf:
        raise HTTPException(status_code=400, detail="CPF is required for personal accounts")
    if body.account_type == "business" and not body.cnpj:
        raise HTTPException(status_code=400, detail="CNPJ is required for business accounts")

    now_iso = datetime.now(timezone.utc).isoformat()
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": body.name.strip(),
        "email": email,
        "password_hash": hash_pw(body.password),
        "account_type": body.account_type,
        "cpf": body.cpf,
        "cnpj": body.cnpj,
        "email_verified": False,
        "usdc_balance": 0.0,
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    await db.users.insert_one(user_doc)

    verif_token = secrets.token_urlsafe(48)
    await db.email_tokens.insert_one(
        {
            "token": verif_token,
            "user_id": user_id,
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat(),
            "consumed": False,
        }
    )
    verification_link = f"{FRONTEND_BASE_URL}/verify-email?token={verif_token}"
    if EMAIL_MOCK_MODE:
        logger.info(f"[MOCK EMAIL] to={email} link={verification_link}")

    access_token = make_token(user_id)
    return AuthResponse(
        access_token=access_token,
        user=user_to_public(user_doc),
        verification_token=verif_token if EMAIL_MOCK_MODE else None,
    )


@api.post("/auth/verify-email")
async def verify_email(body: VerifyEmailRequest):
    tok = await db.email_tokens.find_one({"token": body.token}, {"_id": 0})
    if not tok:
        raise HTTPException(status_code=400, detail="Invalid token")
    if tok["consumed"]:
        raise HTTPException(status_code=400, detail="Token already used")
    expires_at = datetime.fromisoformat(tok["expires_at"])
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token expired")
    await db.users.update_one(
        {"id": tok["user_id"]},
        {"$set": {"email_verified": True, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    await db.email_tokens.update_one(
        {"token": body.token}, {"$set": {"consumed": True}}
    )
    return {"detail": "Email verified"}


@api.post("/auth/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    email = body.email.lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_pw(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.get("email_verified", False):
        raise HTTPException(status_code=403, detail="Email not verified")
    access_token = make_token(user["id"])
    return AuthResponse(access_token=access_token, user=user_to_public(user))


@api.get("/auth/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)):
    return user_to_public(user)


@api.post("/auth/resend-verification")
async def resend_verification(body: dict):
    email = (body.get("email") or "").lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        return {"detail": "If account exists, email sent"}
    if user.get("email_verified"):
        return {"detail": "Already verified"}
    verif_token = secrets.token_urlsafe(48)
    await db.email_tokens.insert_one(
        {
            "token": verif_token,
            "user_id": user["id"],
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat(),
            "consumed": False,
        }
    )
    return {
        "detail": "Verification email sent",
        "verification_token": verif_token if EMAIL_MOCK_MODE else None,
    }


@api.get("/balance")
async def balance(user: dict = Depends(get_current_user)):
    rate = await get_rate()
    usdc = float(user.get("usdc_balance", 0.0))
    return {
        "usdc": usdc,
        "brl": round(usdc * rate.usdc_brl, 2),
        "rate": rate.usdc_brl,
    }


@api.get("/transactions", response_model=List[TransactionOut])
async def list_transactions(
    type: Optional[str] = None, user: dict = Depends(get_current_user)
):
    query = {"user_id": user["id"]}
    if type and type != "all":
        query["type"] = type
    cursor = db.transactions.find(query, {"_id": 0}).sort("created_at", -1).limit(200)
    items = await cursor.to_list(length=200)
    return [
        TransactionOut(
            id=t["id"],
            type=t["type"],
            amount_usdc=t["amount_usdc"],
            amount_brl=t.get("amount_brl"),
            recipient_name=t.get("recipient_name"),
            note=t.get("note"),
            status=t["status"],
            created_at=t["created_at"],
        )
        for t in items
    ]


@api.post("/transactions", response_model=TransactionOut, status_code=201)
async def create_transaction(
    body: TransactionCreate, user: dict = Depends(get_current_user)
):
    tx_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    tx = {
        "id": tx_id,
        "user_id": user["id"],
        "type": body.type,
        "amount_usdc": body.amount_usdc,
        "amount_brl": body.amount_brl,
        "recipient_name": body.recipient_name,
        "note": body.note,
        "status": body.status,
        "created_at": now_iso,
    }
    await db.transactions.insert_one(tx)

    # Update balance if completed
    if body.status == "completed":
        delta = body.amount_usdc if body.type == "funded" else -body.amount_usdc
        await db.users.update_one(
            {"id": user["id"]}, {"$inc": {"usdc_balance": delta}}
        )

    return TransactionOut(
        id=tx_id,
        type=tx["type"],
        amount_usdc=tx["amount_usdc"],
        amount_brl=tx.get("amount_brl"),
        recipient_name=tx.get("recipient_name"),
        note=tx.get("note"),
        status=tx["status"],
        created_at=tx["created_at"],
    )


@api.post("/card/waitlist")
async def card_waitlist(body: dict, user: dict = Depends(get_current_user)):
    entry = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "email": user["email"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.card_waitlist.update_one(
        {"user_id": user["id"]}, {"$set": entry}, upsert=True
    )
    return {"detail": "Added to waitlist"}


@api.get("/card/status")
async def card_status(user: dict = Depends(get_current_user)):
    entry = await db.card_waitlist.find_one({"user_id": user["id"]}, {"_id": 0})
    return {"on_waitlist": bool(entry), "status": "coming_soon"}


# ------------- Seeding -------------
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.email_tokens.create_index("token", unique=True)
    await db.transactions.create_index([("user_id", 1), ("created_at", -1)])

    # Seed demo user
    demo_email = "demo" + chr(64) + "jato.app"
    existing = await db.users.find_one({"email": demo_email})
    if not existing:
        now_iso = datetime.now(timezone.utc).isoformat()
        uid = str(uuid.uuid4())
        await db.users.insert_one(
            {
                "id": uid,
                "name": "Demo Brazil",
                "email": demo_email,
                "password_hash": hash_pw("Demo@1234"),
                "account_type": "personal",
                "cpf": "12345678909",
                "cnpj": None,
                "email_verified": True,
                "usdc_balance": 12450.00,
                "created_at": now_iso,
                "updated_at": now_iso,
            }
        )
        # Seed transactions
        seed_txs = [
            {
                "type": "funded",
                "amount_usdc": 5000.0,
                "amount_brl": 27100.0,
                "recipient_name": None,
                "note": "PIX fund via Transak",
                "status": "completed",
                "days_ago": 1,
            },
            {
                "type": "card_spend",
                "amount_usdc": 84.50,
                "amount_brl": None,
                "recipient_name": "Uber Eats",
                "note": "Card spend",
                "status": "completed",
                "days_ago": 2,
            },
            {
                "type": "funded",
                "amount_usdc": 7500.0,
                "amount_brl": 40650.0,
                "recipient_name": None,
                "note": "PIX fund",
                "status": "completed",
                "days_ago": 4,
            },
            {
                "type": "card_spend",
                "amount_usdc": 42.10,
                "amount_brl": None,
                "recipient_name": "Spotify",
                "note": "Subscription",
                "status": "completed",
                "days_ago": 6,
            },
            {
                "type": "card_spend",
                "amount_usdc": 230.00,
                "amount_brl": None,
                "recipient_name": "Whole Foods NYC",
                "note": "Groceries abroad",
                "status": "pending",
                "days_ago": 7,
            },
        ]
        for t in seed_txs:
            days = t.pop("days_ago")
            tx_dt = datetime.now(timezone.utc) - timedelta(days=days)
            await db.transactions.insert_one(
                {
                    "id": str(uuid.uuid4()),
                    "user_id": uid,
                    **t,
                    "created_at": tx_dt.isoformat(),
                }
            )
        logger.info("Seeded demo user " + demo_email + " / Demo@1234")


@app.on_event("shutdown")
async def shutdown():
    client.close()


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
