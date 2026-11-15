# S1-04: Sign-Up, Confirmation & Sign-In

**Details:** Priority: Must | Track A | Days 2–5  
**Acceptance Criteria:** See [acceptance-criteria.md](./acceptance-criteria.md)

## Done When
- A new user can register, confirm their email (or phone OTP if enabled), sign in, and sign out through Supabase Auth.
- Protected backend endpoints reject missing, malformed, expired, or wrong-issuer JWTs.
- FindStay never stores password hashes, OTP tables, or service-role keys in browser assets.

## Tasks

| Task ID | Task | Tag | Depends On | Role | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| [`S1-04-T1`](./tasks/S1-04-T1.md) | Design registration, email/OTP verification & sign-in flows | `ui-ux` | [`S1-01-T3`](../S1-01/tasks/S1-01-T3.md), [`S1-01-T4`](../S1-01/tasks/S1-01-T4.md) | UI/UX Design |  | Todo |
| [`S1-04-T2`](./tasks/S1-04-T2.md) | Create identity.user_profile table & seed core roles | `database` | [`S1-01-T9`](../S1-01/tasks/S1-01-T9.md) | Database & Data |  | Todo |
| [`S1-04-T3`](./tasks/S1-04-T3.md) | Configure Supabase Auth URLs & redirect allow-lists | `devops` | [`S1-02-T3`](../S1-02/tasks/S1-02-T3.md) | Architecture, Cloud & Security |  | Todo |
| [`S1-04-T4`](./tasks/S1-04-T4.md) | Configure Spring Security OAuth2 Resource Server (JWKS) | `backend` | [`S1-01-T7`](../S1-01/tasks/S1-01-T7.md), [`S1-04-T3`](./tasks/S1-04-T3.md) | Backend Development |  | Todo |
| [`S1-04-T5`](./tasks/S1-04-T5.md) | Implement GET/PATCH /api/v1/me profile provisioning | `backend` | [`S1-04-T2`](./tasks/S1-04-T2.md), [`S1-04-T4`](./tasks/S1-04-T4.md) | Backend Development |  | Todo |
| [`S1-04-T6`](./tasks/S1-04-T6.md) | Build React sign-up, confirmation & sign-in screens with Turnstile | `frontend` | [`S1-03-T5`](../S1-03/tasks/S1-03-T5.md), [`S1-04-T1`](./tasks/S1-04-T1.md), [`S1-04-T3`](./tasks/S1-04-T3.md), [`S1-04-T5`](./tasks/S1-04-T5.md) | Frontend Development |  | Todo |
| [`S1-04-T7`](./tasks/S1-04-T7.md) | Test auth flows, JWT rejection & browser key safety | `testing` | [`S1-04-T4`](./tasks/S1-04-T4.md), [`S1-04-T5`](./tasks/S1-04-T5.md), [`S1-04-T6`](./tasks/S1-04-T6.md) | QA & Testing |  | Todo |
