# FindStay — Sprint 1 Kickoff Notes & Checkpoints (`S1-01-T14`)

- **Task:** [`S1-01-T14`](../scrum/sprint-01/stories/S1-01/tasks/S1-01-T14.md) (Issue [#23](https://github.com/ObboyeBossman/findstay/issues/23))
- **Story:** [`S1-01`](../scrum/sprint-01/stories/S1-01/README.md) — Project Setup & System Design
- **Facilitator:** Anthony Maclean (`@dztrb`)
- **Date:** 2026-11-16
- **Sprint:** Sprint 1 — Foundation and Verified Owner Listings (Release `R1`)
- **Attendance:** All 9 active Sprint 1 team members confirmed present and aligned:
   - Anthony Maclean (`@dztrb`) — UI/UX Design; kickoff facilitator
  - Bright Afedi (`@kwesipaa643-sys`) — Product & Requirements
  - Mashkura Tahiru (`@maskkuratahiru-wq`) — UI/UX Design & Frontend
  - Emmanuel Rockson (`@surnuel`) — UI/UX Design & Frontend
   - Bossman Abraham N. O. (`@ObboyeBossman`) — Team Lead & Scrum Master; Tech Lead / Cloud & Security
  - Joseph Osei-Bonsu (`@joseibonsu206-gif`) — Backend Development
  - Solomon Fummey (`@fummey`) — Database & Testing
  - Sampson Badu (`@badu12-png`) — QA & Testing
  - Okyere Ankomah Julius (`@Ankomah959Julius`) — Database & Data

---

## 1. Sprint 1 Key Dates & Checkpoints

| Milestone | Date | Gate / Purpose |
| :--- | :---: | :--- |
| **Day 1 — Sprint 1 starts (planning & task assignment)** | **2026-11-15** | Plan baseline approved; stories split into tasks and assigned to the team. |
| **Day 2 — Sprint 1 Kickoff meeting (`S1-01-T14`)** | **2026-11-16** | Confirm plan, decisions, task handouts, and checkpoint dates (this meeting). |
| **Day 2 — Infrastructure Gate** | **2026-11-16** | Confirm Supabase limits, Render hosting, Cloudflare R2 buckets, and SMS sender-ID status. |
| **Day 3 — Foundation Gate** | **2026-11-17** | `S1-01` (monorepo, CI, Flyway, staging deploy) live on staging; otherwise feature work pauses. |
| **Day 8 — Feature Freeze** | **2026-11-22** | No new feature stories start after Day 8; transition to stabilisation & testing. |
| **Day 10 — Sprint Review & Demo** | **2026-11-24** | Run 7-step demo on staging and review Release `R1` acceptance. |

> **Calendar correction (2026-11-19, Product Owner):** Sprint 1 started on **Sunday 15 November 2026**, not 16 November. Days are counted in calendar days from that start (**Day N = 15 Nov + N − 1**), so Day 4 is 18 Nov (as already labelled in the `S1-02` evidence files) and 19 Nov is Day 5. An earlier version of this table counted the kickoff meeting (16 Nov) as Day 1 and listed the gates as 17 Nov (Day 2), 18 Nov (Day 3), 23 Nov (Day 8) and 25 Nov (Day 10). Dates of things that actually happened — this meeting on 16 Nov, task completions, evidence files — are unchanged.

---

## 2. Kickoff Agenda

1. **Sprint 1 Goal & 7-Step Demo Script** ([`sprint-01.md`](../scrum/sprint-01/sprint-01.md)):
   - Verified owner registers → company space created → invites staff → uploads Ghana Card, ownership proof & GTA licence → builds listing with `WebP` photos, units & availability calendar → admin approves & publishes → live on staging with daily backups and audit trail.
2. **Delivery Rules & Priority Order** ([`scrum-rules.md`](../scrum/scrum-rules.md)):
   - Build strictly in priority order: **`Must` → `Should` → `Could`**.
   - All-or-nothing shipping rule: incomplete stories are feature-flagged out before Sprint Review.
3. **Design & Architecture Decisions Check** ([`settled-decisions.md`](../scrum/sprint-01/decisions/settled-decisions.md)):
   - Confirm settled stack & stakeholder decisions (`J-06`, `P-02`, `P-04`, `P-08`, `P-09`, `P-12`) and align with `S1-01-T1`'s confirmed work list.
4. **Task Handouts (`S1-01-T1` – `S1-01-T16`)**:
   - Each assignee confirms their deliverable in one sentence and their target completion day (Days 1–3).
5. **Day 2 & Day 3 Gate Checkpoints**:
   - Agree on checkpoint times and escalation rules for `2026-11-16` (Day 2) and `2026-11-17` (Day 3).

---

## 3. Confirmed Design & Architecture Decisions

### Target Stack & Hosting Topology
| ID / Layer | Confirmed Staging Setup |
| :--- | :--- |
| **Frontend (`web/`)** | React + TypeScript + Vite + Tailwind CSS deployed on **Cloudflare Workers Static Assets** (`findstay-web-staging.obboyebossman.workers.dev`) |
| **Backend (`api/`)** | Java 21 + Spring Boot 3 modular monolith (`Spring Modulith`) on **Render Web Service** (`findstay-api-staging.onrender.com`) |
| **Database** | PostgreSQL 17.11 on **Supabase Session Pooler** (port 5432), managed exclusively via Flyway migrations |
| **Object Storage** | **Cloudflare R2** (`findstay-property-images-staging` public CDN + `findstay-verification-docs-staging` private via pre-signed URLs) |
| **Auth** | **Supabase Auth** (1-hr access JWTs + refresh rotation; `api/` verifies via JWKS) |

### Core Architectural Contracts
| ID | Contract Decision |
| :--- | :--- |
| **`J-06`** | Multi-company `organization_id` isolation (`OrgScope`) on every owner-scoped read or write from Day 1. |
| **`P-02`** | Individual bookable `unit_id` records with `availability_block` & `btree_gist` overlap lock. |
| **`P-04`** | Role-membership authorization (`Guest` + `Owner` / `Staff` scoped per org/property). |
| **`P-08`** | Ghana SMS provider behind `NotificationSender`, with email-only OTP fallback if sender-ID takes past Day 2. |
| **`P-09`** | 1-hr JWT + refresh rotation; active-account/membership check on sensitive operations. |
| **`P-12`** | Ghana Act 843 (DPC) consent notices; Ghana Card + ownership proof + GTA licence for owner verification. |

### Confirmed Sprint 1 Working Decisions (from `S1-01-T1`)
1. **Account Confirmation Method (`S1-04`):** Email verification links default for Release R1. SMS OTP will be added once SMS provider sender-ID is approved.
2. **Owner Staff Permissions (`S1-07`):** Staff can create/edit listings, rooms, prices, and availability calendars. Only the primary Owner can manage company staff and submit legal KYC verification.
3. **Upload Limits (`S1-09`):** Property photos accept `JPG`, `PNG`, `WebP` (max 5MB each, up to 10 photos per property). Verification documents accept `PDF`, `JPG`, `PNG` (max 10MB per document).
4. **Notification Channels Priority (`S1-10`):** Unified `NotificationSender` interface with In-App + Email channels live first. SMS provider adapter will be plugged in once credentials are confirmed.
5. **Starter Reference Lists (`S1-01-T15`):** Accommodation types seeded as configurable lookup records (`Single Room`, `Double Room`, `Studio`, `Suite`, `1-Bedroom Apartment`, `2-Bedroom Apartment`, `Entire House`). Billing period `Per Night` is active for Sprint 1; `Per Month`, `Per Term`, and `Academic Year` are seeded inactive.
6. **Admin Bootstrap (`S1-01-T15` / `S1-16`):** One default Admin account pre-seeded via environment variables during initial database setup for secure day-one access.

---

## 4. `S1-01` Task Handouts & One-Sentence Deliverables (Days 1–3)

| Task | Assignee | Depends On | Status | One-Sentence Deliverable ("What I will achieve & by when") |
| :--- | :--- | :---: | :---: | :--- |
| **`S1-01-T1`** | `@kwesipaa643-sys` (Bright Afedi) | — | **Done** | Deliver the confirmed Sprint 1 work list and any open decisions with proposed answers by end of Day 1. |
| **`S1-01-T2`** | `@maskkuratahiru-wq` (Mashkura Tahiru) | `T1` | **Done** | Deliver FindStay's single swappable style/token file (colors, fonts, spacing) before wireframes start. |
| **`S1-01-T3`** | `@dztrb` (Anthony Maclean) | `T1` | **Done** | Deliver screen-to-screen user flow diagrams (happy, error, and empty paths) with screen inventory by Day 2. |
| **`S1-01-T4`** | `@surnuel` (Emmanuel Rockson) | `T2`, `T3` | Todo | Deliver phone-first (`360px+`) and desktop wireframes for every Sprint 1 screen by Day 2. |
| **`S1-01-T5`** | `@maskkuratahiru-wq` (Mashkura Tahiru) | `T2`, `T10` | Todo | Deliver the empty starter React website with Guest, Owner, and Admin portal routes wired by Day 3. |
| **`S1-01-T6`** | `@ObboyeBossman` (Bossman Abraham) | `T1` | Todo | Deliver the backend module map, data-flow diagram, and agreed `/api/v1/...` OpenAPI contracts by Day 2. |
| **`S1-01-T7`** | `@joseibonsu206-gif` (Joseph Osei-Bonsu) | `T6`, `T10` | **Done** | Deliver the empty Spring Boot app with shared pesewa money, UTC/Ghana dates, error format, IDs, and jobs by Day 3. |
| **`S1-01-T8`** | `@fummey` (Solomon Fummey) | `T1`, `T6` | Todo | Deliver the reviewed PostgreSQL ERD covering every Sprint 1 table and relationship by Day 2. |
| **`S1-01-T9`** | `@fummey` (Solomon Fummey) | `T8` | Todo | Deliver numbered Flyway migration scripts (`V1_01..`) matching the ERD on the staging database by Day 3. |
| **`S1-01-T10`** | `@ObboyeBossman` (Bossman Abraham) | — | **Done** | Deliver the protected repo, branch rules, secrets setup, and live staging hosting targets by Day 1. |
| **`S1-01-T11`** | `@ObboyeBossman` (Bossman Abraham) | `T5`, `T7`, `T10` | Todo | Deliver the CI/CD pipeline that automatically builds, tests, and publishes changes to staging by Day 3. |
| **`S1-01-T12`** | `@badu12-png` (Sampson Badu) | `T7`, `T9` | Todo | Deliver Testcontainers integration test setup running against a real throwaway PostgreSQL DB by Day 3. |
| **`S1-01-T13`** | `@fummey` (Solomon Fummey) | `T1` | Todo | Deliver the acceptance walkthrough checklist and `@Req`-tagged repeat-test plan by Day 2. |
| **`S1-01-T14`** | `@dztrb` (Anthony Maclean) | — | **Done** | Run Sprint 1 kickoff, confirm task handouts & decisions, and record Day 2/Day 3 checkpoints on Day 1. |
| **`S1-01-T15`** | `@Ankomah959Julius` (Okyere Ankomah Julius) | `T9` | Todo | Deliver starter reference seed data (room types, billing periods, platform settings) loaded identically everywhere by Day 3. |
| **`S1-01-T16`** | `@badu12-png` (Sampson Badu) | `T5`, `T7`, `T11`, `T15` | Todo | Prove staging is alive end-to-end (server health check green and website reaching API) by end of Day 3. |

> [!NOTE]
> Per `S1-01/README.md`, David Ofori, Seidu Afeadzi, and Theresa are not assigned Sprint 1 tasks yet (pending invitation/poll).

---

## 5. Gate Checklists (Day 2 & Day 3)

### Day 2 Gate — `2026-11-16`
- [x] Supabase PostgreSQL Session Pooler connected on port 5432 & Auth JWKS verified
- [x] Render always-on web service live (`findstay-api-staging.onrender.com`)
- [x] Cloudflare R2 buckets (`findstay-property-images-staging`, `findstay-verification-docs-staging`) created & verified
- [x] Cloudflare Workers web staging live (`findstay-web-staging.obboyebossman.workers.dev`)
- [x] Protected repo branch rules (`main`, `staging`) enforced
- [ ] Ghana SMS sender-ID status checked (if delayed past `2026-11-16`, activate `P-08` email-only OTP fallback)
- [ ] Design & contract tasks (`T4`, `T6`, `T8`, `T13`) completed & reviewed

### Day 3 Gate — `2026-11-17`
- [ ] `web/` starter shell live on Cloudflare Workers staging (`T5`)
- [ ] `api/` Spring Boot app + Flyway migrations (`T7`, `T9`, `T15`) live on Render staging
- [ ] CI/CD pipeline (`T11`) and Testcontainers suite (`T12`) green
- [ ] End-to-end staging health check (`T16`) verified — if not live by end of Day 3, pause feature work until resolved
