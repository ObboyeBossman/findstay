# FindStay — Technical & Delivery Requirements (`TA-*`, `PD-*`)

> **Traceability:** Allocated across Sprints 1–5 in [`docs/scrum/scrum.md`](../../scrum/scrum.md).
> **Total Items:** 26

| ID | Requirement | Module | Phase | Sprint | Story |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `TA-01` | Web-based application built in three separate layers: User Screens (React), Backend Business Logic (Spring Boot), and Database/Services (Supabase). | `platform` | P1+P2 | S1 | S1-01 |
| `TA-02` | The frontend communicates with the backend server through secure REST API web requests (/api/v1/...). | `platform` | P1+P2 | S1 | S1-01 |
| `TA-03` | Dedicated interfaces for guests, property owners and administrators. | `platform` | P1+P2 | S2 | S2-04 |
| `TA-04` | Integrate with Paystack Ghana; support MTN Mobile Money, Telecel Cash, AT Money and bank cards. | `payments` | P1 | S2 | S2-09 |
| `TA-05` | Validate payment webhook signatures (HMAC-SHA512). | `payments` | P1+P2 | S2 | S2-11 |
| `TA-06` | Maintain transaction references and payment timestamps. | `payments` | P1+P2 | S2 | S2-10 |
| `TA-07` | Password hashing is managed by Supabase Auth; application code never stores or hashes passwords. | `identity` | P1+P2 | S1 | S1-04 |
| `TA-08` | Supabase JWT-based authentication with one-hour access tokens and managed refresh-token rotation; Spring validates JWTs through JWKS. | `identity` | P1+P2 | S1 | S1-04 |
| `TA-09` | Encryption of sensitive identification information at rest. | `platform` | P1+P2 | S1 | S1-12 |
| `TA-10` | No storage of raw payment-card credentials. | `payments` | P1+P2 | S2 | S2-09 |
| `TA-11` | Secure storage of database passwords and payment-provider secret keys (environment variables). | `platform` | P1+P2 | S1 | S1-02 |
| `TA-12` | Property photographs stored using Cloudflare R2. | `media` | P1+P2 | S1 | S1-09 |
| `TA-13` | Images compressed, optimised and served in modern lightweight formats (WebP). | `media` | P1+P2 | S1 | S1-09 |
| `PD-01` | Documented requirements analysis and system design. | `platform` | P1+P2 | S1 | S1-01 |
| `PD-02` | Database design and implementation. | `platform` | P1+P2 | S1 | S1-01 |
| `PD-03` | Core account, access, listing, search, booking and payment functionality. | `platform` | P1 | S2 | S2-14 |
| `PD-04` | Owner and administrator operational modules. | `platform` | P1 | S3 | S3-14 |
| `PD-05` | Security testing and user-acceptance testing. | `platform` | P1+P2 | S3 | S3-14 |
| `PD-06` | Deployment to cloud infrastructure (frontend via Cloudflare Workers Static Assets/CDN; Spring Boot on Render; database and storage on Supabase). | `platform` | P1+P2 | S1 | S1-02 |
| `PD-07` | Module-level, workflow/integration and user-acceptance testing. | `platform` | P1+P2 | S1 | S1-01 |
| `PD-08` | Test authentication, authorisation, search/filtering, booking-conflict prevention, payment verification and timeout. | `platform` | P1+P2 | S2 | S2-14 |
| `PD-09` | Test financial calculations, review eligibility, property verification/approval and mobile responsiveness. | `platform` | P1+P2 | S3 | S3-14 |
| `PD-10` | Backend application-health monitoring. | `platform` | P1+P2 | S1 | S1-02 |
| `PD-11` | Daily automated database backups. | `platform` | P1+P2 | S1 | S1-02 |
| `PD-12` | Confidential credentials stored in secure environment settings, not source code. | `platform` | P1+P2 | S1 | S1-02 |
| `PD-13` | Deployment must support real users. | `platform` | P1+P2 | S3 | S3-14 |
