// JATO API client. Reads access token from secure storage on every request.
import { storage } from "@/src/utils/storage";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL || "";

type Json = Record<string, unknown> | unknown[];

class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any) {
    super(typeof body?.detail === "string" ? body.detail : `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function request<T = any>(
  path: string,
  opts: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: Json;
    auth?: boolean;
  } = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = opts;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (auth) {
    const token = await storage.secureGet<string>("jato_token", "");
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed: any = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  if (!res.ok) throw new ApiError(res.status, parsed);
  return parsed as T;
}

export type User = {
  id: string;
  name: string;
  email: string;
  account_type: "personal" | "business";
  cpf?: string | null;
  cnpj?: string | null;
  email_verified: boolean;
  usdc_balance: number;
  created_at: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
  verification_token?: string | null;
};

export type Transaction = {
  id: string;
  type: "funded" | "sent" | "card_spend";
  amount_usdc: number;
  amount_brl?: number | null;
  recipient_name?: string | null;
  note?: string | null;
  status: "completed" | "pending" | "failed";
  created_at: string;
};

export type RateResponse = { usdc_brl: number; cached: boolean; fetched_at: string };

export const api = {
  ApiError,
  signup: (body: {
    name: string;
    email: string;
    password: string;
    account_type: "personal" | "business";
    cpf?: string;
    cnpj?: string;
  }) => request<AuthResponse>("/auth/signup", { method: "POST", body, auth: false }),
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    }),
  verifyEmail: (token: string) =>
    request<{ detail: string }>("/auth/verify-email", {
      method: "POST",
      body: { token },
      auth: false,
    }),
  resendVerification: (email: string) =>
    request<{ detail: string; verification_token?: string }>(
      "/auth/resend-verification",
      { method: "POST", body: { email }, auth: false },
    ),
  me: () => request<User>("/auth/me"),
  rate: () => request<RateResponse>("/rate", { auth: false }),
  balance: () => request<{ usdc: number; brl: number; rate: number }>("/balance"),
  listTransactions: (type?: string) =>
    request<Transaction[]>(`/transactions${type ? `?type=${type}` : ""}`),
  createTransaction: (tx: {
    type: "funded" | "sent" | "card_spend";
    amount_usdc: number;
    amount_brl?: number;
    recipient_name?: string;
    note?: string;
    status?: "completed" | "pending" | "failed";
  }) => request<Transaction>("/transactions", { method: "POST", body: tx }),
  cardStatus: () =>
    request<{ on_waitlist: boolean; status: string }>("/card/status"),
  cardWaitlist: () =>
    request<{ detail: string }>("/card/waitlist", { method: "POST", body: {} }),
};
