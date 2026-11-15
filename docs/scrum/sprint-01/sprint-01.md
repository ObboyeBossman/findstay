# FindStay — Sprint 1: Foundation and Verified Owner Listings

| | |
|---|---|
| **Weeks** | Weeks 1–2 |
| **Release** | Phase 1, Release `R1` (Owner and administrator pilot release) |
| **Requirement Items** | 108 |
| **Related Docs** | [Acceptance Criteria](./acceptance-criteria/acceptance-criteria.md) · [Settled Decisions](./decisions/settled-decisions.md) · [Scrum Rules](../scrum-rules.md) |

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
| `S1-01` | Project setup & system design | Must | A | D1–D3 | [S1-01-project-setup-and-design.md](./stories/S1-01-project-setup-and-design.md) |
| `S1-02` | Live hosting & daily backups | Must | A | D2–D4 | [S1-02-live-hosting-and-backups.md](./stories/S1-02-live-hosting-and-backups.md) |
| `S1-03` | Mobile & desktop page layouts | Must | B | D2–D5 | [S1-03-responsive-page-layouts.md](./stories/S1-03-responsive-page-layouts.md) |
| `S1-04` | Sign-up, confirmation & sign-in | Must | A | D2–D5 | [S1-04-auth-and-sign-in.md](./stories/S1-04-auth-and-sign-in.md) |
| `S1-05` | Password reset & user profile | Must | A | D5–D6 | [S1-05-password-reset-and-profile.md](./stories/S1-05-password-reset-and-profile.md) |
| `S1-06` | Role permissions & safe access | Must | A | D4–D6 | [S1-06-rbac-and-security.md](./stories/S1-06-rbac-and-security.md) |
| `S1-07` | Owner companies & staff access | Must | A | D4–D7 | [S1-07-organisations-and-staff-access.md](./stories/S1-07-organisations-and-staff-access.md) |
| `S1-08` | Permanent activity log | Should | A | D5–D7 | [S1-08-audit-trail.md](./stories/S1-08-audit-trail.md) |
| `S1-09` | Photo & document uploads | Must | B | D4–D6 | [S1-09-photo-and-document-uploads.md](./stories/S1-09-photo-and-document-uploads.md) |
| `S1-10` | Email, SMS & in-app alerts | Must | A | D5–D7 | [S1-10-notifications-and-alerts.md](./stories/S1-10-notifications-and-alerts.md) |
| `S1-11` | Privacy notice & user consent | Should | A | D6–D7 | [S1-11-privacy-and-consent.md](./stories/S1-11-privacy-and-consent.md) |
| `S1-12` | Owner ID & property verification | Must | B | D6–D8 | [S1-12-owner-verification.md](./stories/S1-12-owner-verification.md) |
| `S1-13` | Create properties, rooms & prices | Must | B | D4–D8 | [S1-13-properties-units-and-rates.md](./stories/S1-13-properties-units-and-rates.md) |
| `S1-14` | Availability calendar & owner blocks | Must | B | D7–D8 | [S1-14-availability-calendar.md](./stories/S1-14-availability-calendar.md) |
| `S1-15` | Approval queue & publishing | Must | B | D7–D8 | [S1-15-approval-queue-and-publishing.md](./stories/S1-15-approval-queue-and-publishing.md) |
| `S1-16` | User management, settings & dashboard | Should | B | D6–D8 | [S1-16-user-management-and-settings.md](./stories/S1-16-user-management-and-settings.md) |
| `S1-17` | Stabilise, regression & release `R1` | Must | A | D9–D10 | [S1-17-stabilise-and-release-r1.md](./stories/S1-17-stabilise-and-release-r1.md) |

---

## 4. Sprint Review Demo Script (7 Steps)
1. An owner registers with email, confirms it, and signs in.
2. Their company space is created automatically; they invite a staff member and grant permission for one property.
3. The owner uploads their Ghana Card, ownership proof, and tourism licence; an admin sees the case in the approval queue.
4. The owner creates a property with two units, `WebP` photos, prices, amenities, and house rules, and blocks dates on the calendar.
5. The admin approves the listing; it goes live and the owner receives an email alert.
6. The admin suspends and restores a user; both actions appear in the permanent activity log.
7. A second owner cannot see the first owner's data, and the database passes a backup restore drill.

---

## 5. Key Risks
- **Foundation Delay:** If the walking skeleton (`S1-01`) is not live by Day 3, pause feature work until it is.
- **SMS Approval:** If Ghana SMS sender-ID approval takes past Day 2, launch `R1` with email-only OTP fallback (`P-08`).
- **Hosting Limits:** Verify Cloudflare R2 buckets and Render non-sleeping hosting on Day 2.
