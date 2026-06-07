# JATO — Product Requirements (MVP)

## Overview
JATO is a Brazilian cross-border USDC payment platform built as an Expo React Native mobile app (web-rendered preview). Tagline: "Send money. De jato." Operated by CarbonTide Inc, a Delaware corporation.

## Tech Stack
- **Frontend:** Expo SDK 54, expo-router, React Native 0.81, Inter font, Phantom/Linear-style dark fintech UI
- **Backend:** FastAPI + MongoDB (Motor), JWT auth (bcrypt+pyjwt)
- **Rate:** CoinGecko `usd-coin/brl` (cached 5min, fallback 5.42)
- **Storage:** Encrypted SecureStore for JWT

## Screens
1. **Landing (/)** — Hero "Send money. De jato.", live rate ticker, 3 feature cards (PIX/USDC/Card), 3-step how-it-works, pricing card (0.5% JATO + 3.5% Transak), legal footer.
2. **Signup (/signup)** — Name, email, CPF/CNPJ (auto-switches by account type toggle), password+confirm, validates 11/14 digits.
3. **Login (/login)** — Email/password, demo-fill chip.
4. **Verify email (/verify-email)** — Mock-mode "Verify now" button uses resend → verify token flow.
5. **Dashboard (/(app)/dashboard)** — Large USDC balance card with BRL equivalent + Base chip, 3 quick-action buttons (Fund/Card/History), recent activity list.
6. **Fund (/fund)** — BRL keypad input, live USDC conversion preview, quick-amount chips, PIX as method, fee breakdown (Transak 3.5% + JATO 0.5%), Open Transak button → opens `global-stg.transak.com` with `apiKey=1c338a51..., network=base, cryptoCurrencyCode=USDC, fiatCurrency=BRL, paymentMethod=pix`, success screen with green check.
7. **Card (/(app)/card)** — Dark JATO Visa card mockup, Coming Soon pill, Order physical card → joins waitlist.
8. **History (/(app)/history)** — Sticky filter chips (All/Funded/Card spend/Sent), status badges (Completed/Pending/Failed).
9. **Settings (/(app)/settings)** — Profile (name, email, CPF/CNPJ read-only, account type), notification toggles, legal links, logout.
10. **Legal pages (/legal/terms, /legal/privacy, /legal/risk)** — Full CarbonTide Inc legal text.

## Auth contract
- JWT signed with HS256, 7-day expiry (configurable).
- Signup creates user with `email_verified=false`. Login enforces verification (403 if not verified).
- Email verification: 64-byte URL-safe token, 24h expiry, single-use. Mock mode logs link; returns token in response for demo.

## Endpoints
- `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/verify-email`, `POST /api/auth/resend-verification`, `GET /api/auth/me`
- `GET /api/rate`, `GET /api/balance`
- `GET /api/transactions?type=`, `POST /api/transactions`
- `GET /api/card/status`, `POST /api/card/waitlist`

## Legal
Every footer + auth screens display: "JATO is operated by CarbonTide Inc, a Delaware corporation. Not a bank. USDC is not FDIC insured. Not available to US persons. Payment processing by Transak. Card services by Gnosis Pay."

## Mock / non-functional in MVP
- **Email sending: MOCKED** — verification tokens returned in API response; UI has a "Verify now (mock)" button.
- **Transak**: real staging widget opens; PIX flow happens in Transak. JATO records the funded transaction immediately for demo (so balance increments visibly in the app).
- **Gnosis Pay card**: waitlist only; "Coming soon" status.
