# S1-01-T1: Agreed Sprint 1 (Release R1) Work List & Open Decisions — FindStay

> **Deliverable of S1-01-T1** ([GitHub issue #18](https://github.com/ObboyeBossman/findstay/issues/18)) — owner @kwesipaa643-sys (Bright Afedi). First shared on the issue as “Sprit1-confirm”; moved here and aligned with the billing-period rule (`docs/rules/module-boundaries.md`) and `NFR-46`.

## 1. Story S1-01: Project Setup & System Design (16 Foundation Tasks)
All 16 foundation tasks are **In Scope**, clear, and appropriately sized for our 9-person team. Together, they deliver our complete system design and put the empty app live on staging:

* **Phase 1 — Alignment & Design (T1–T4)**
  * **S1-01-T1:** Confirm the Sprint 1 work list — what we build first, agreed by everyone. *(Size: S — Current Task)*
  * **S1-01-T2:** Pick FindStay's colors, fonts & spacing in one swappable style file. *(Size: S)*
  * **S1-01-T3:** Draw user flow diagrams mapping every screen-to-screen path across Guest, Owner, and Admin. *(Size: M)*
  * **S1-01-T4:** Sketch phone-first wireframes for every Sprint 1 screen. *(Size: M)*

* **Phase 2 — Architecture & Infrastructure (T6, T8, T10–T12)**
  * **S1-01-T6:** Draw backend map & data-flow diagram and agree on API contracts. *(Size: M)*
  * **S1-01-T8:** Draw the database diagram (ERD) covering every table and relationship. *(Size: M)*
  * **S1-01-T10:** Set up the code repo, branch protection rules, secrets, and staging hosting. *(Size: S)*
  * **S1-01-T11:** Build CI/CD pipeline to automatically test and publish changes to staging. *(Size: M)*
  * **S1-01-T12:** Set up automated test runner using an isolated throwaway database. *(Size: M)*

* **Phase 3 — Skeleton Build & Verification (T5, T7, T9, T13–T16)**
  * **S1-01-T9:** Build the real database from the ERD using numbered migration scripts. *(Size: M — Depends on T8)*
  * **S1-01-T15:** Seed starter reference lists (room types, billing periods, settings). *(Size: S — Depends on T9)*
  * **S1-01-T7:** Set up the empty server app with shared middleware, error handling, and DB connection. *(Size: M — Depends on T6, T10)*
  * **S1-01-T5:** Build the empty starter website with Guest, Owner, and Admin areas wired up. *(Size: M — Depends on T2, T4, T10)*
  * **S1-01-T13:** Write the acceptance walkthrough and repeat-test plan for Sprint 1. *(Size: S — Depends on T3, T4)*
  * **S1-01-T14:** Run team kickoff, assign tasks across the 9 members, and set checkpoints. *(Size: S — Depends on T1)*
  * **S1-01-T16:** Smoke-test staging to prove the server is healthy and the website reaches the server. *(Size: S — Final gate for S1-01)*

---

## 2. Sprint 1 Feature Stories (S1-02 to S1-17 — In Scope for Release R1)
Every story from `S1-01` to `S1-17` is accounted for, needed, and grouped below by build order:

* **Group A — Infrastructure, Layouts & Security (S1-02 to S1-08)**
  * **S1-02: Live Hosting & Daily Backups** — Configure production/staging environments with automated daily database backups. *(Size: M)*
  * **S1-03: Mobile & Desktop Page Layouts** — Responsive navigation shells and shared page layouts for Guest, Owner, and Admin. *(Size: M — Depends on S1-01-T2, T5)*
  * **S1-04: Sign-Up, Confirmation & Sign-In** — User registration, account confirmation, and login flow. *(Size: M)*
  * **S1-05: Password Reset & User Profile** — Self-service password recovery and profile view/edit screens. *(Size: S — Depends on S1-04)*
  * **S1-06: Role Permissions & Safe Access** — Enforce role-based access control (Guest, Owner, Staff, Admin) across routes and APIs. *(Size: M — Depends on S1-04)*
  * **S1-07: Owner Companies & Staff Access** — Allow owners to create a company profile and invite/manage staff members. *(Size: M — Depends on S1-06)*
  * **S1-08: Permanent Activity Log** — Record an immutable audit trail of critical user, owner, and admin actions. *(Size: M)*

* **Group B — Uploads, Alerts & Compliance (S1-09 to S1-11)**
  * **S1-09: Photo & Document Uploads** — Secure upload and storage pipeline for property photos and verification documents. *(Size: M)*
  * **S1-10: Email, SMS & In-App Alerts** — Notification engine supporting Email, SMS, and In-App alerts for key events. *(Size: L — Recommend modularizing by channel so Email/In-App don't block on SMS)*
  * **S1-11: Privacy Notice & User Consent** — Display privacy notice and store timestamped user consent records. *(Size: S)*

* **Group C — Owner Listings & Admin Approval (S1-12 to S1-17)**
  * **S1-12: Owner ID & Property Verification** — Submission flow for owners to upload ID and ownership proof for admin review. *(Size: M — Depends on S1-09)*
  * **S1-13: Create Properties, Rooms & Prices** — Forms and APIs for owners to create properties, add room types, and set prices/billing periods. *(Size: L — Depends on S1-01-T15, S1-09)*
  * **S1-14: Room Availability Calendar** — Calendar UI and logic for owners to manage open and blocked dates per room. *(Size: M — Depends on S1-13)*
  * **S1-15: Admin Review & Listing Approval** — Admin review queue to verify owner documents and approve or reject property listings. *(Size: M — Depends on S1-12, S1-13)*
  * **S1-16: Admin Dashboard, Users & Settings** — Admin overview metrics, user management controls, and system reference settings editor. *(Size: M)*
  * **S1-17: Final Testing & Release R1** — Run full acceptance walkthrough (`S1-01-T13`), resolve bugs, and sign off on Release R1. *(Size: M)*

---

## 3. Out of Scope for Sprint 1 (Deferred to Sprint 2 / Release R2)
To ensure Release R1 ships cleanly and on schedule, the following guest-facing transaction features are explicitly **excluded** from Sprint 1:
* **Public Property Search, Map View & Filtering** (Deferred until verified inventory exists via `S1-15`).
* **Guest Booking Requests & Checkout Flow** (Deferred to Sprint 2).
* **Online Payment Processing, Payouts & Refunds** (Deferred to Sprint 2).
* **Guest Reviews, Ratings & Messaging** (Deferred to Sprint 2).

---

## 4. Open Decisions & Proposed Answers
Please review and confirm these 6 defaults so no teammate is blocked during `S1-01` design and setup:

1. **Account Confirmation Method (`S1-04`):** Should account confirmation use Email verification links, SMS OTP, or both?
   * **Proposed Answer:** Use **Email verification links** as the default for R1 (with optional SMS OTP if our SMS gateway is configured early in `S1-10`).
2. **Owner Staff Permissions (`S1-07`):** What can Owner Staff do compared to the primary Owner?
   * **Proposed Answer:** Owner Staff can create/edit properties, rooms, prices (`S1-13`), and availability calendars (`S1-14`), but only the primary Owner can manage company staff (`S1-07`) and submit legal verification (`S1-12`).
3. **File Types & Size Limits (`S1-09`):** What limits apply to uploaded photos and verification documents?
   * **Proposed Answer:** Property photos accept `JPG`, `PNG`, `WEBP` (max `5MB` per image, up to 10 photos per property). Verification documents accept `PDF`, `JPG`, `PNG` (max `10MB` per file).
4. **Notification Channels Priority (`S1-10`):** What if third-party SMS credentials take time to approve?
   * **Proposed Answer:** Build a unified notification service interface first; wire up **In-App + Email** immediately, and plug in the **SMS** provider adapter as soon as API keys are added to staging secrets (`S1-01-T10`).
5. **Starter Reference Lists (`S1-01-T15`):** What initial values should be seeded into the database?
   * **Proposed Answer:**
     * **Room Types:** `Single Room`, `Double Room`, `Studio`, `Suite`, `1-Bedroom Apartment`, `2-Bedroom Apartment`, `Entire House` — stored as a configurable `accommodation_type` lookup table per `NFR-46`, so new types (such as student hostels) can be added later without code changes.
     * **Billing Periods:** `Per Night` is the only billing period switched on for Sprint 1; `Per Month`, `Per Term`, and `Academic Year` are seeded but switched off until Sprints 4–5 (hostel billing). Weekly billing is not part of the plan. *(Aligned with the billing-period rule in `docs/rules/module-boundaries.md`.)*
6. **Admin Bootstrap (`S1-01-T15` / `S1-16`):** How is the first Admin account created on staging?
   * **Proposed Answer:** Seed one default Admin account via environment variables during initial database setup (`S1-01-T9` / `T15`) so admins can log in immediately without needing public admin sign-up.

---
**Status:** Confirmed by the project lead (Bossman) on 2026-11-17 — **S1-01-T1** is done ([issue #18](https://github.com/ObboyeBossman/findstay/issues/18) closed); **S1-01-T14 (Kickoff)** proceeds.
