# FindStay — Settled Architecture & Product Decisions (Sprint 1)

## 1. Settled Infrastructure & Stack Decisions

| Layer | Approved Choice | Details |
| :--- | :--- | :--- |
| **Frontend (`web/`)** | **React + TypeScript + Vite** on **Cloudflare Workers Static Assets** | Single unified web application with route-based portals (`/`, `/auth/*`, `/owner/*`, `/admin/*`) and one feature folder per backend module (`web/src/features/*`). |
| **Backend (`api/`)** | **Java 21 + Spring Boot 3** on **Render** | Modular monolith (`Spring Modulith`) enforcing strict `api/` vs `internal/` module boundaries. |
| **Database** | **PostgreSQL 16** on **Render** (migrated by **Flyway**) | Private network connection to `api/` on Render; all schema changes managed exclusively by Flyway in `api/src/main/resources/db/migration/V1_01..V1_19`. |
| **Object Storage** | **Cloudflare R2** | Public bucket (`findstay-property-images`) for optimized `WebP` listing photos; private bucket (`findstay-verification-docs`) for Ghana Cards, ownership deeds, and GTA licences via short-lived pre-signed URLs issued by `api/`. |
| **Authentication** | **Supabase Auth** | Issues 1-hour access JWTs with refresh-token rotation; `api/` verifies Bearer JWTs via Supabase JWKS (`SUPABASE_JWKS_URI`). |

---

## 2. Settled Stakeholder Decisions (Sprint 1 — Release `R1`)

| ID | Topic | Status | Settled Decision | Affected Stories / Requirements |
| :--- | :--- | :---: | :--- | :--- |
| **J-06** | **Multi-company onboarding & data isolation** | **Settled** | Each property owner receives an `organization` record from Day 1 in a single shared PostgreSQL database. All properties, units, documents, bookings, and staff memberships are isolated by `organization_id` via `OrgScope`. | `S1-07`, `UR-O15`, `UR-PS01`, `UR-PSN01`, `UR-PM03`, `FR-09`, `BRL-04`, `BRL-05` |
| **P-02** | **Unit model (`FR-15` vs `FR-40`)** | **Settled** | Every bookable unit (room, apartment, suite) is tracked individually with its own `unit_id`, availability calendar, and `btree_gist` date-range overlap lock (`availability_block`), and may be optionally grouped by unit type/category for display. | `S1-13`, `S1-14`, `FR-11`..`FR-18`, `FR-39`, `FR-40` |
| **P-04** | **Role model vs `BRL-02`** | **Settled** | An account holds role memberships (e.g., Guest plus Owner or Staff scoped to an organisation or specific property). `BRL-02` is interpreted as role-membership authorization rather than a single global role per email. | `S1-06`, `S1-07`, `FR-07`, `FR-09`, `BRL-02` |
| **P-08** | **Phone verification & SMS provider** | **Settled** | Integrate a Ghana-supported SMS provider (Arkesel / Hubtel / mNotify) behind the `NotificationSender` interface, with email-only OTP fallback in Release `R1` if sender-ID registration takes past Day 2. | `S1-04`, `S1-10`, `FR-02`, `FR-68`..`FR-71` |
| **P-09** | **Sign-in session & token lifecycle** | **Settled** | Supabase Auth issues 1-hour access JWTs and rotates refresh tokens automatically in the React client. Spring Boot validates Bearer tokens via Supabase JWKS and performs an active-account/membership check on sensitive operations. | `S1-04`, `S1-06`, `FR-01`, `FR-03`, `FR-05`, `NFR-19`, `NFR-22`, `TA-07`, `TA-08` |
| **P-12** | **Act 843 regulator wording & owner verification documents** | **Settled** | Privacy and consent notices reference the **Data Protection Commission (DPC)** under Ghana's Data Protection Act, 2012 (Act 843). Owner verification requires a valid **Ghana Card**, proof of property ownership/authorisation, and a **Ghana Tourism Authority (GTA)** licence where applicable. | `S1-11`, `S1-12`, `UR-O01`, `FR-08`, `NFR-28`, `NFR-31`, `NFR-32`, `NFR-34`..`NFR-36`, `TA-09` |
