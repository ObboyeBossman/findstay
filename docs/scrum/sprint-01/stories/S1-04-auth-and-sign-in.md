# S1-04: Supabase Auth integration, email verification, login/logout and JWT validation

**Details:** Pri M, track A, D2 to D5
**Acceptance Criteria:** [See S1-04 in acceptance-criteria.md](../acceptance-criteria/acceptance-criteria.md)

## What Needs to Be Done
- *Done when:* A new user registers, completes Supabase email confirmation (or phone OTP if P-08 selects a supported SMS provider), logs in and logs out through Supabase Auth; protected Spring endpoints reject anonymous or invalid JWTs.
- *Database:* `user_profile` stores the immutable Supabase user ID and FindStay profile data; roles seeded: Guest, Owner/Manager, Property Staff, Administrator. No application credential, OTP-challenge or token-store tables are created.
- *API:* Spring Security OAuth2 Resource Server validates Supabase JWTs from JWKS; `GET/PATCH /me` provisions and updates the local profile. Configure the Supabase Site URL and allow-listed redirect URLs for the Cloudflare environments. Spring has no registration, password, reset or refresh-token endpoints.
- *UI:* React screens use `@supabase/supabase-js` with the project publishable key for registration, email confirmation, optional phone OTP, login, logout and password recovery; Cloudflare Turnstile protects sign-up and sign-in.
- *Tests:* Email-confirmation and sign-in flows (and phone OTP if enabled); malformed, expired and wrong-issuer JWT rejection; anonymous access rejected on every protected route; no Supabase secret or service-role key is present in browser assets.
