# FindStay — Supabase Auth & Redirect Allow-List Configuration

- **Task:** [`S1-04-T3`](../scrum/sprint-01/stories/S1-04/tasks/S1-04-T3.md)
- **Story:** [`S1-04`](../scrum/sprint-01/stories/S1-04/README.md) — Sign-Up, Confirmation & Sign-In
- **Role:** Architecture, Cloud & Security (`@ObboyeBossman`)
- **Requirements Satisfied:**
  - `TA-07` — Supabase Auth session issuance and public JWKS endpoint.
  - `TA-08` — 1-hour access token lifecycle with refresh rotation.
  - `NFR-27` — Protection of confidential credentials.

---

## 1. Supabase Project Auth Endpoints

| Environment | Parameter | Configured Value |
| :--- | :--- | :--- |
| **Staging** | Project URL | `https://xavnlsinbzfcaacfzqac.supabase.co` |
| **Staging** | JWKS URI | `https://xavnlsinbzfcaacfzqac.supabase.co/auth/v1/.well-known/jwks.json` |
| **Staging** | Site URL | `https://findstay-web-staging.obboyebossman.workers.dev` |

---

## 2. Redirect URL Allow-List

To ensure secure OAuth/Email confirmation callback handoffs without open-redirect vulnerabilities:

1. `https://findstay-web-staging.obboyebossman.workers.dev/auth/callback`
2. `https://findstay-web-staging.obboyebossman.workers.dev/auth/sign-in`
3. `http://localhost:3000/auth/callback` (Local Development - standard web port)
4. `http://localhost:5173/auth/callback` (Local Development - Vite default port)

---

## 3. Email Confirmation & Password Policy Settings

- **Confirm Email:** Enabled (Kickoff Decision 1: Email confirmation link is default for Release R1).
- **Secure Email Change:** Enabled.
- **Minimum Password Length:** 8 characters.
- **JWT Expiration Limit:** 3600 seconds (1 hour) per `TA-08` contract.
- **Refresh Token Rotation:** Enabled.

---

## 4. Integration Seams

- **Frontend (`web/src/lib/supabase.ts`):** Initialized using `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- **Backend (`api/src/main/resources/application.yml`):** Spring Security OAuth2 Resource Server validates token signatures against `SUPABASE_JWKS_URI`.
