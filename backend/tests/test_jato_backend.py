"""JATO backend API tests — auth, rate, balance, transactions, card."""
import os
import uuid
import pytest
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load backend .env for FRONTEND_BASE_URL fallback
load_dotenv(Path(__file__).parent.parent / ".env")

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL") or os.environ.get("FRONTEND_BASE_URL") or "https://jato-payments.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

# Demo creds built via concat (literal @ is obfuscated in source)
DEMO_EMAIL = "demo" + chr(64) + "jato.app"
DEMO_PW = "Demo" + chr(64) + "1234"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="module")
def demo_token(s):
    r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PW})
    assert r.status_code == 200, f"Demo login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


def auth_headers(tok):
    return {"Authorization": f"Bearer {tok}"}


# --- Rate ---
class TestRate:
    def test_rate_returns_number(self, s):
        r = s.get(f"{API}/rate")
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d["usdc_brl"], (int, float))
        assert d["usdc_brl"] > 0


# --- Signup ---
class TestSignup:
    def test_signup_personal_returns_token(self, s):
        email = f"test_{uuid.uuid4().hex[:8]}" + chr(64) + "jato.app"
        payload = {
            "name": "Test User",
            "email": email,
            "password": "Pass@1234",
            "account_type": "personal",
            "cpf": "12345678901",
        }
        r = s.post(f"{API}/auth/signup", json=payload)
        assert r.status_code == 201, r.text
        d = r.json()
        assert "access_token" in d
        assert "user" in d
        assert d["user"]["email"] == email
        assert d["user"]["email_verified"] is False
        assert d["verification_token"], "verification_token must be present in mock mode"

    def test_signup_personal_missing_cpf(self, s):
        email = f"test_{uuid.uuid4().hex[:8]}" + chr(64) + "jato.app"
        r = s.post(f"{API}/auth/signup", json={
            "name": "X", "email": email, "password": "Pass@1234",
            "account_type": "personal",
        })
        assert r.status_code == 400

    def test_signup_business_missing_cnpj(self, s):
        email = f"test_{uuid.uuid4().hex[:8]}" + chr(64) + "jato.app"
        r = s.post(f"{API}/auth/signup", json={
            "name": "X", "email": email, "password": "Pass@1234",
            "account_type": "business",
        })
        assert r.status_code == 400

    def test_signup_duplicate_email(self, s):
        r = s.post(f"{API}/auth/signup", json={
            "name": "Demo", "email": DEMO_EMAIL, "password": "Pass@1234",
            "account_type": "personal", "cpf": "12345678909",
        })
        assert r.status_code == 400


# --- Login ---
class TestLogin:
    def test_demo_login_success(self, s):
        r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PW})
        assert r.status_code == 200
        assert r.json()["access_token"]

    def test_login_wrong_password(self, s):
        r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_login_unverified_user_403(self, s):
        email = f"unv_{uuid.uuid4().hex[:8]}" + chr(64) + "jato.app"
        pw = "Pass@1234"
        r = s.post(f"{API}/auth/signup", json={
            "name": "Unv", "email": email, "password": pw,
            "account_type": "personal", "cpf": "11122233344",
        })
        assert r.status_code == 201
        r2 = s.post(f"{API}/auth/login", json={"email": email, "password": pw})
        assert r2.status_code == 403


# --- Verify email ---
class TestVerifyEmail:
    def test_verify_then_reuse_then_invalid(self, s):
        email = f"verif_{uuid.uuid4().hex[:8]}" + chr(64) + "jato.app"
        r = s.post(f"{API}/auth/signup", json={
            "name": "V", "email": email, "password": "Pass@1234",
            "account_type": "personal", "cpf": "11122233355",
        })
        assert r.status_code == 201
        tok = r.json()["verification_token"]
        access = r.json()["access_token"]

        r2 = s.post(f"{API}/auth/verify-email", json={"token": tok})
        assert r2.status_code == 200

        me = s.get(f"{API}/auth/me", headers=auth_headers(access))
        assert me.status_code == 200
        assert me.json()["email_verified"] is True

        r3 = s.post(f"{API}/auth/verify-email", json={"token": tok})
        assert r3.status_code == 400
        assert "already used" in r3.json()["detail"].lower()

        r4 = s.post(f"{API}/auth/verify-email", json={"token": "not-a-real-token"})
        assert r4.status_code == 400

    def test_resend_verification_returns_new_token(self, s):
        email = f"resend_{uuid.uuid4().hex[:8]}" + chr(64) + "jato.app"
        r = s.post(f"{API}/auth/signup", json={
            "name": "R", "email": email, "password": "Pass@1234",
            "account_type": "personal", "cpf": "11122233366",
        })
        assert r.status_code == 201
        r2 = s.post(f"{API}/auth/resend-verification", json={"email": email})
        assert r2.status_code == 200
        assert r2.json().get("verification_token")


# --- /auth/me ---
class TestMe:
    def test_me_with_token(self, s, demo_token):
        r = s.get(f"{API}/auth/me", headers=auth_headers(demo_token))
        assert r.status_code == 200
        assert r.json()["email"] == DEMO_EMAIL

    def test_me_missing_token(self, s):
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_invalid_token(self, s):
        r = s.get(f"{API}/auth/me", headers=auth_headers("garbage"))
        assert r.status_code == 401


# --- Balance ---
class TestBalance:
    def test_balance(self, s, demo_token):
        r = s.get(f"{API}/balance", headers=auth_headers(demo_token))
        assert r.status_code == 200
        d = r.json()
        for k in ("usdc", "brl", "rate"):
            assert k in d
        assert isinstance(d["usdc"], (int, float))


# --- Transactions ---
class TestTransactions:
    def test_list_demo_has_5(self, s, demo_token):
        r = s.get(f"{API}/transactions", headers=auth_headers(demo_token))
        assert r.status_code == 200
        txs = r.json()
        assert len(txs) >= 5

    def test_filter_funded(self, s, demo_token):
        r = s.get(f"{API}/transactions?type=funded", headers=auth_headers(demo_token))
        assert r.status_code == 200
        txs = r.json()
        assert len(txs) >= 1
        assert all(t["type"] == "funded" for t in txs)

    def test_filter_card_spend(self, s, demo_token):
        r = s.get(f"{API}/transactions?type=card_spend", headers=auth_headers(demo_token))
        assert r.status_code == 200
        txs = r.json()
        assert all(t["type"] == "card_spend" for t in txs)

    def test_create_funded_increments_balance(self, s):
        # Use a fresh verified user to keep demo balance assertions stable
        email = f"tx_{uuid.uuid4().hex[:8]}" + chr(64) + "jato.app"
        pw = "Pass@1234"
        sg = s.post(f"{API}/auth/signup", json={
            "name": "Tx", "email": email, "password": pw,
            "account_type": "personal", "cpf": "11122233377",
        })
        assert sg.status_code == 201
        tok_email = sg.json()["verification_token"]
        s.post(f"{API}/auth/verify-email", json={"token": tok_email})
        lg = s.post(f"{API}/auth/login", json={"email": email, "password": pw})
        assert lg.status_code == 200
        tok = lg.json()["access_token"]

        b0 = s.get(f"{API}/balance", headers=auth_headers(tok)).json()["usdc"]
        r = s.post(f"{API}/transactions",
                   headers=auth_headers(tok),
                   json={"type": "funded", "amount_usdc": 100,
                         "amount_brl": 542, "note": "test fund"})
        assert r.status_code == 201
        b1 = s.get(f"{API}/balance", headers=auth_headers(tok)).json()["usdc"]
        assert round(b1 - b0, 2) == 100.0

        # card_spend decrements
        r2 = s.post(f"{API}/transactions",
                    headers=auth_headers(tok),
                    json={"type": "card_spend", "amount_usdc": 30})
        assert r2.status_code == 201
        b2 = s.get(f"{API}/balance", headers=auth_headers(tok)).json()["usdc"]
        assert round(b1 - b2, 2) == 30.0


# --- Card ---
class TestCard:
    def test_status_then_waitlist(self, s):
        # Use a fresh verified user to avoid demo state mutation
        email = f"card_{uuid.uuid4().hex[:8]}" + chr(64) + "jato.app"
        pw = "Pass@1234"
        sg = s.post(f"{API}/auth/signup", json={
            "name": "Card", "email": email, "password": pw,
            "account_type": "personal", "cpf": "11122233388",
        })
        assert sg.status_code == 201
        s.post(f"{API}/auth/verify-email", json={"token": sg.json()["verification_token"]})
        tok = s.post(f"{API}/auth/login", json={"email": email, "password": pw}).json()["access_token"]

        r = s.get(f"{API}/card/status", headers=auth_headers(tok))
        assert r.status_code == 200
        d = r.json()
        assert d["on_waitlist"] is False
        assert d["status"] == "coming_soon"

        r2 = s.post(f"{API}/card/waitlist", headers=auth_headers(tok), json={})
        assert r2.status_code == 200

        r3 = s.get(f"{API}/card/status", headers=auth_headers(tok))
        assert r3.json()["on_waitlist"] is True
