# FindStay — Sprint 1: Foundation and Verified Owner Listings

| | |
|---|---|
| **Weeks** | Weeks 1–2 |
| **Release** | Phase 1, Release `R1` (Owner and administrator pilot release) |
| **Requirement Items** | 108 |
| **Related Docs** | [Acceptance Criteria Index](./acceptance-criteria/acceptance-criteria.md) · [Settled Decisions](./decisions/settled-decisions.md) · [Scrum Rules](../scrum-rules.md) |

---

## 1. Sprint Goal
A verified property owner can register, get their company space, invite staff, submit verification documents, and build a listing with photos and an availability calendar—and an administrator can approve and publish it—all running live with daily backups and monitoring.

---

## 2. Technology Baseline
- **Website (`web/`):** React + TypeScript + Vite + Tailwind CSS, hosted on **Cloudflare Workers Static Assets**.
- **Backend Server (`api/`):** Java 21 + Spring Boot 3, hosted on **Render**.
- **Database:** **Render PostgreSQL** (managed by Flyway migrations `V1_01`–`V1_19`).
- **Object Storage:** **Cloudflare R2** (public `WebP` photos + private verification documents).
- **Authentication:** **Supabase Auth** (sign-up, email/phone verification, password recovery, and 1-hour JWTs).

---

## 3. Sprint 1 Backlog (17 Stories)

| Story | Title | Priority | Track | Days | Link |
|-------|-------|:--------:|:-----:|:----:|------|
| `S1-01` | Project setup & system design | Must | A | D1–D3 | [S1-01](./stories/S1-01/README.md) |
| `S1-02` | Live hosting & daily backups | Must | A | D2–D4 | [S1-02](./stories/S1-02/README.md) |
| `S1-03` | Mobile & desktop page layouts | Must | B | D2–D5 | [S1-03](./stories/S1-03/README.md) |
| `S1-04` | Sign-up, confirmation & sign-in | Must | A | D2–D5 | [S1-04](./stories/S1-04/README.md) |
| `S1-05` | Password reset & user profile | Must | A | D5–D6 | [S1-05](./stories/S1-05/README.md) |
| `S1-06` | Role permissions & safe access | Must | A | D4–D6 | [S1-06](./stories/S1-06/README.md) |
| `S1-07` | Owner companies & staff access | Must | A | D4–D7 | [S1-07](./stories/S1-07/README.md) |
| `S1-08` | Permanent activity log | Should | A | D5–D7 | [S1-08](./stories/S1-08/README.md) |
| `S1-09` | Photo & document uploads | Must | B | D4–D6 | [S1-09](./stories/S1-09/README.md) |
| `S1-10` | Email, SMS & in-app alerts | Must | A | D5–D7 | [S1-10](./stories/S1-10/README.md) |
| `S1-11` | Privacy notice & user consent | Should | A | D6–D7 | [S1-11](./stories/S1-11/README.md) |
| `S1-12` | Owner ID & property verification | Must | B | D6–D8 | [S1-12](./stories/S1-12/README.md) |
| `S1-13` | Create properties, rooms & prices | Must | B | D4–D8 | [S1-13](./stories/S1-13/README.md) |
| `S1-14` | Room availability calendar | Must | B | D7–D8 | [S1-14](./stories/S1-14/README.md) |
| `S1-15` | Admin review & listing approval | Must | B | D7–D8 | [S1-15](./stories/S1-15/README.md) |
| `S1-16` | Admin dashboard, users & settings | Should | B | D6–D8 | [S1-16](./stories/S1-16/README.md) |
| `S1-17` | Final testing & Release `R1` | Must | A | D9–D10 | [S1-17](./stories/S1-17/README.md) |

---

## 4. Sprint Review Demo Script (7 Steps)

> The click-by-click execution checklist for this script — and the foundation checks before it — is [`docs/testing/acceptance-walkthrough-sprint-1.md`](../../testing/acceptance-walkthrough-sprint-1.md); what must keep passing after every change is [`docs/testing/regression-plan-r1.md`](../../testing/regression-plan-r1.md).
1. An owner registers with email, confirms it, and signs in.
2. Their company space is created automatically; they invite a staff member and grant permission for one property.
3. The owner uploads their Ghana Card, ownership proof, and tourism licence; an admin sees the case in the approval queue.
4. The owner creates a property with two units, `WebP` photos, prices, amenities, and house rules, and blocks dates on the calendar.
5. The admin approves the listing; it goes live and the owner receives an email alert.
6. The admin suspends and restores a user; both actions appear in the permanent activity log.
7. A second owner cannot see the first owner's data, and the database passes a backup restore drill.

---

## 5. Key Risks
- **Foundation Delay:** If project setup & system design (`S1-01`) is not live by Day 3, pause feature work until it is.
- **SMS Approval:** If Ghana SMS sender-ID approval takes past Day 2, launch `R1` with email-only OTP fallback (`P-08`).
- **Hosting Limits:** Verify Cloudflare R2 buckets and Render non-sleeping hosting on Day 2.
