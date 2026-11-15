# S1-04: Acceptance Criteria

- **Story:** [S1-04: Sign-Up, Confirmation & Sign-In](./README.md)
- **Who this helps:** Guests, Property Owners, Property Staff, and Administrators signing up and signing in
- **Priority:** Must have | **Track:** Track A | **Days:** D2–D5
- **Summary:** Let users create an account, confirm their email or phone code, and sign in and out safely using Supabase Auth.
- **Screens involved:** Sign Up (/auth/register), Confirm Email/OTP (/auth/verify), Sign In (/auth/login)
- **Database tables:** identity.user_profile, identity.role (Guest, Owner/Manager, Property Staff, Administrator)
- **System actions:** Supabase Auth sign-up/login/logout + Spring Boot JWT validation via JWKS + GET/PATCH /api/v1/me

## What Proves This Story Is Finished

1. A new user can register, confirm their email (or phone OTP if enabled), sign in, and sign out through Supabase Auth.
2. Protected backend endpoints reject missing, malformed, expired, or wrong-issuer JWTs.
3. FindStay never stores password hashes, OTP tables, or service-role keys in browser assets.

## Linked Requirements

- **Business:** [`BRL-01`](../../../../requirements/business/business-requirements.md)
- **Functional:** [`UR-G01`](../../../../requirements/functional/functional-requirements.md), [`FR-01`](../../../../requirements/functional/functional-requirements.md), [`FR-02`](../../../../requirements/functional/functional-requirements.md), [`FR-03`](../../../../requirements/functional/functional-requirements.md), [`FR-05`](../../../../requirements/functional/functional-requirements.md)
- **Non-Functional:** [`NFR-19`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-22`](../../../../requirements/non-functional/non-functional-requirements.md)
- **Technical:** [`TA-07`](../../../../requirements/technical/technical-requirements.md), [`TA-08`](../../../../requirements/technical/technical-requirements.md)
