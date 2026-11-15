# 05 — Settled Stakeholder Decisions (Sprint 1)

All six Sprint 1 stakeholder decisions (`J-06`, `P-02`, `P-04`, `P-08`, `P-09`, `P-12`) have been formally settled and are binding on Sprint 1 (`R1`) implementation.

| ID | Topic | Status | Settled Decision | Affected Stories / Requirements |
| :--- | :--- | :---: | :--- | :--- |
| **J-06** | **Multi-company onboarding & data isolation** | **Settled** | Each property owner receives an `organization` record from Day 1 in a single shared PostgreSQL database. All properties, units, documents, bookings, and staff memberships are isolated by `organization_id` via `OrgScope`. | `S1-07`, `UR-O15`, `UR-PS01`, `UR-PSN01`, `UR-PM03`, `FR-09`, `BRL-04`, `BRL-05` |
| **P-02** | **Unit model (`FR-15` vs `FR-40`)** | **Settled** | Every bookable unit (room, apartment, suite) is tracked individually with its own `unit_id`, availability calendar, and `btree_gist` date-range overlap lock (`availability_block`), and may be optionally grouped by unit type/category for display. | `S1-13`, `S1-14`, `FR-11`..`FR-18`, `FR-39`, `FR-40` |
| **P-04** | **Role model vs `BRL-02`** | **Settled** | An account holds role memberships (e.g., Guest plus Owner or Staff scoped to an organisation or specific property). `BRL-02` is interpreted as role-membership authorization rather than a single global role per email. | `S1-06`, `S1-07`, `FR-07`, `FR-09`, `BRL-02` |
| **P-08** | **Phone verification & SMS provider** | **Settled** | Integrate a Ghana-supported SMS provider (e.g., Arkesel / Hubtel / mNotify) behind the `NotificationSender` interface, with email-only OTP fallback in Release `R1` if sender-ID registration takes past Day 2. | `S1-04`, `S1-10`, `FR-02`, `FR-68`..`FR-71` |
| **P-09** | **Sign-in session & token lifecycle** | **Settled** | Supabase Auth issues 1-hour access JWTs and rotates refresh tokens automatically in the React client. Spring Boot validates Bearer tokens via Supabase JWKS and performs an active-account/membership check on sensitive operations (role changes, verification decisions, publishing, suspension). | `S1-04`, `S1-06`, `FR-01`, `FR-03`, `FR-05`, `NFR-19`, `NFR-22`, `TA-07`, `TA-08` |
| **P-12** | **Act 843 regulator wording & owner verification documents** | **Settled** | Privacy and consent notices reference the **Data Protection Commission (DPC)** under Ghana's Data Protection Act, 2012 (Act 843). Owner verification requires a valid **Ghana Card**, proof of property ownership/authorisation, and a **Ghana Tourism Authority (GTA)** licence where applicable. | `S1-11`, `S1-12`, `UR-O01`, `FR-08`, `NFR-28`, `NFR-31`, `NFR-32`, `NFR-34`..`NFR-36`, `TA-09` |

---

## Previously Closed Architecture & Scope Decisions

- **J-01, J-02, P-01 (Closed in Phased Plan):** Two-phase delivery (Phase 1: Sprints 1–3 short-stay marketplace; Phase 2: Sprints 4–5 long-term rentals, maintenance, accounting, and student hostels).

## Deferred Decisions (For Sprints 2–5)

The following decisions remain scheduled for their respective sprint gates:
- **Sprint 2 Day 1:** `P-03` (Booking states & hold rules), `P-10` (Background job hosting), `P-07` (Monetisation split), `J-03 (fees)` (Commission & guest convenience-fee rules).
- **Sprint 3 Day 1:** `J-03 (payouts)` (Payout timing), `P-06` (Cancellation policy templates), `P-05` (Performance, uptime & compliance targets).
- **Sprint 4 Day 8:** `Hostel scope` (Student hostel unit of sale & billing period), `J-04` (AI-assisted support), `J-05` (Text-to-speech), `P-11` (Calendar integration boundary).
