# FindStay — Scrum Sprint Plan: Ten Weeks, Five Releases

| | |
|---|---|
| **Project** | FindStay Accommodation Discovery and Property Management Platform |
| **Document** | Sprint-level breakdown of the Phased Delivery Plan |
| **Source** | `findstay-phased-delivery-plan.md` (allocation of the Consolidated Requirements Register, 13 November 2026) |
| **Date** | 14 November 2026 |
| **Status** | Revised draft for approval — capacity controls added |

## Contents

- 1. Purpose, Assumptions and Method
- 2. Ten-Week Overview
- 3. Scrum Framework
- 4. The No-Conflict Contract
- 5. Decision Gates by Sprint
- 6. Sprint 1: Foundation and Verified Owner Listings
- 7. Sprint 2: Search, Book and Pay
- 8. Sprint 3: Operate, Trust and Go-Live
- 9. Sprint 4: Long-Term Rentals and Maintenance
- 10. Sprint 5: Accountants, Student Hostels and Final Release
- 11. Traceability, Counts and Carried-Over Items
- Appendix A. Allocation Ledger (every requirement ID)

---

## 1. Purpose, Assumptions and Method

This document turns the approved two-phase plan into five two-week Scrum sprints. Every sprint ends with a complete, tested and deployed increment, and no sprint needs the code, schema or contracts of an earlier sprint to be reworked. The ten weeks are used as follows: **Sprints 1 to 3 (weeks 1 to 6) deliver Phase 1** and **Sprints 4 and 5 (weeks 7 to 10) deliver Phase 2**.

**What is unchanged.** Phase codes, modules, the eight seams and the dependency rules are exactly as in the phased plan. Each of the 304 requirement IDs has one owning sprint and one acceptance story. Appendix A proves this, and Section 11 gives the counts. A requirement can still be re-verified by later regression or extended through an explicitly named Phase 2 follow-on story; it is not counted as newly delivered twice.

**Stack revision.** This plan adopts the approved FindStay stack: Supabase Auth, PostgreSQL and Storage; Java 21 / Spring Boot 3 on Render; and React / Vite hosted on Cloudflare Workers Static Assets. Legacy references to custom Spring credential handling, Cloudinary and Vercel have been replaced. Supabase owns credentials, password recovery, email verification, session refresh and JWT issuance; Spring owns FindStay authorisation and business rules.

**What this document adds.**

- Sprint goals, a releasable increment and a demo script for each sprint.
- Stories with the requirement IDs they deliver, a task breakdown (database, API, UI, tests) and a day-by-day plan for the ten working days.
- A no-conflict contract (Section 4) and, for each sprint, a list of what it must build in so the next sprint needs no edits.
- Decision gates with the sprint day by which each open decision is needed.

**How a requirement is assigned to a sprint.** A requirement is accepted in the sprint where its last dependency lands. Examples: reviews appear on the listing page (UR-G04) in Sprint 3 because reviews arrive in Sprint 3; availability holds (FR-41) are in Sprint 2 because booking is. Where the phased plan placed an item in a milestone that this timeline compresses, the mapping is in Section 11.4.

**Assumptions to confirm.**

1. A sprint is ten working days. Day 1 is a Monday. The dates in this document are illustrative only: the proposed November start crosses Christmas and New Year, so the Product Owner must select a ten-week window that accounts for classes, exams and public holidays before Sprint 1 Planning.
2. The project has an eleven-member student team, with several delivery roles, but available person-days and delivery velocity are still unknown. Tracks A, B and C are work streams, not evidence that three teams can work in parallel. Sprint Planning must set the Sprint Backlog from actual capacity under Section 3.6.
3. Items marked *proposed default* in Section 5 are my suggestions where the phased plan leaves a decision open. They keep a sprint unblocked and are not decisions until you confirm them.
4. Student hostels have no source requirement IDs. Their stories in Sprint 5 are derived from Section 5.5 of the phased plan and need your approval.

**A candid note on scope.** Delivering all of this in ten weeks is a very tight schedule: 277 requirements bind Phase 1 (95 of them cross-cutting) and Phase 2 adds six new domain modules. The plan keeps every requirement in scope and manages the risk through ordering (Must, Should, Could per story), a strict spill rule (Section 3.5) and early decision gates. If real velocity falls short after Sprint 1, the Could and Should stories move through change control rather than being silently dropped.

---

## 2. Ten-Week Overview

```text
 WEEK    1   2 | 3   4 | 5   6 | 7   8 | 9  10
 SPRINT    1   |   2   |   3   |   4   |   5
 PHASE   [----- Phase 1 ------------] [- Phase 2 -]
 RELEASE   R1  |   R2  |   R3  |   R4  |   R5
          owner| guest | launch| rent &| hostels,
          & adm| book &|  ops, | maint.| accounts,
          list | pay   | trust |       | final
```

| Sprint | Weeks | Planning window | Phase | Release | Name | Items | Release type |
|:------:|-------|---------------|:-----:|:-------:|------|:-----:|--------------|
| 1 | Weeks 1-2 | Start to +9 working days | Phase 1 | R1 | Foundation and Verified Owner Listings | 108 | Owner and administrator release (production, invited pilot owners only) |
| 2 | Weeks 3-4 | +10 to +19 working days | Phase 1 | R2 | Search, Book and Pay | 90 | Guest release (production, invited pilot; refunds handled manually by an administrator until Sprint 3) |
| 3 | Weeks 5-6 | +20 to +29 working days | Phase 1 | R3 | Operate, Trust and Go-Live | 79 | Phase 1 public launch (production, open to real users) |
| 4 | Weeks 7-8 | +30 to +39 working days | Phase 2 | R4 | Long-Term Rentals and Maintenance | 18 | Phase 2 release 1 (production) |
| 5 | Weeks 9-10 | +40 to +49 working days | Phase 2 | R5 | Accountants, Student Hostels and Final Release | 9 | Phase 2 final release (production) |

The Items column is the number of requirement IDs accepted in each sprint (total 304). It is a traceability count, not a sizing estimate: Sprint 1 carries many standing non-functional items that are established as design rules from the first day, while Sprints 4 and 5 contain larger Phase 2 domain features. The Product Owner sets the calendar after the capacity check in Section 3.6. Section 11.1 shows the split between features and cross-cutting items.

**Standalone sprint documents.** Each sprint is also available as an independent working document:

- [Sprint 1 — Foundation and Verified Owner Listings](sprints/sprint-01-foundation-and-verified-owner-listings.md)
- [Sprint 2 — Search, Book and Pay](sprints/sprint-02-search-book-and-pay.md)
- [Sprint 3 — Operate, Trust and Go-Live](sprints/sprint-03-operate-trust-and-go-live.md)
- [Sprint 4 — Long-Term Rentals and Maintenance](sprints/sprint-04-long-term-rentals-and-maintenance.md)
- [Sprint 5 — Accountants, Student Hostels and Final Release](sprints/sprint-05-accountants-student-hostels-and-final-release.md)

**Sprint goals**

- **Sprint 1 (R1).** A verified owner can register, create an organisation, add staff, submit verification documents, build a listing with photos and an availability calendar, and an administrator can approve it, all running in production with backups and monitoring.
- **Sprint 2 (R2).** A guest finds a verified listing, requests a booking, the owner accepts, the guest pays with Mobile Money or card through Paystack, the booking is confirmed only after verified payment, and the guest gets a QR voucher.
- **Sprint 3 (R3).** Phase 1 is complete: cancellations and refunds, payouts, owner finance, messaging, reviews, complaints and disputes, reports and moderation all work, the platform is hardened, and the Phase 1 exit checklist is passed.
- **Sprint 4 (R4).** A manager runs long-term rentals end to end: applicants apply, tenants sign leases and pay deposits and rent, arrears and late fees are tracked, and maintenance requests flow from tenants to staff and vendors, all without editing Phase 1 code.
- **Sprint 5 (R5).** Accountants reconcile and report, student hostels can be listed and let on term-based agreements, and the optional items (AI-assisted support, text-to-speech, calendar integration, remaining monetisation) are delivered, ending with a full regression and Phase 2 sign-off.

---

## 3. Scrum Framework

### 3.1 Roles

| Role | Who | Responsibility |
|------|-----|----------------|
| Product Owner | Project owner / supervisor | Orders the backlog, decides the open decisions in Section 5, accepts or rejects each increment at Sprint Review. |
| Scrum Master | A team member, part-time if needed | Protects the time-boxes, removes blockers, runs the retrospective. |
| Developers | Development team | Plan and build the sprint, own quality, deploy, and demonstrate. |

### 3.2 The ten-day sprint timetable

The same timetable repeats in every sprint.

| Day | Time | Event | Time-box | Output |
|:---:|------|-------|:--------:|--------|
| D1 | 09:00 | Sprint Planning: Sprint Goal, then how (tasks) | 4 h | Sprint Goal and Sprint Backlog from this document |
| D1 to D10 | 09:00 | Daily Scrum | 15 min | Progress against the Sprint Goal, blockers |
| D4 | 14:00 | Backlog refinement for the next sprint | 1 h | Acceptance criteria, decisions chased |
| D5 | 14:00 | Mid-sprint inspection against the Sprint Goal | 30 min | Any Must story not started is escalated; spill rule applied |
| D7 | 14:00 | Backlog refinement and decision check | 1 h | Next sprint's Definition of Ready met |
| D8 | 17:00 | Feature freeze | - | Only fixes merge after this point |
| D9 | 09:00 | Staging regression and user-acceptance testing | 3 h | Regression of all earlier sprints green |
| D9 | 14:00 | Production release and smoke test | 2 h | Tagged release, backup taken first, rollback ready |
| D10 | 10:00 | Sprint Review (demo to the Product Owner) | 2 h | Increment accepted or rejected per story |
| D10 | 13:00 | Sprint Retrospective | 1.5 h | One to three improvements for the next sprint |
| D10 | 15:00 | Pre-planning for the next sprint | 1 h | Next sprint's stories ready; open decisions listed |
| D10 | rest | Hotfix buffer | - | Fixes to the release just shipped |

### 3.3 Definition of Ready (a story may enter a sprint when)

- It lists its requirement IDs and acceptance criteria.
- Any decision it depends on is closed, or a default is recorded in Section 5.
- Its dependencies from earlier sprints are already released.
- Wireframe or screen sketch exists for each screen it adds.
- Test data and, where needed, provider accounts (Paystack, SMS, Supabase) are available.

### 3.4 Definition of Done (a story is done only when all hold)

- Code reviewed and merged to the main branch; CI is green, including the module-boundary check.
- Each requirement ID in the story has at least one automated test tagged with that ID.
- Database migrations are additive, inside the sprint's migration range, and run from an empty database and from a copy of the previous release.
- The OpenAPI contract has no breaking change against the previous release.
- Security checks pass: no secrets in code, input validated, role and organisation checks tested.
- Every state change writes an audit entry, and every status change that concerns a user raises its notification event.
- Works at 360 px width on a throttled connection and in the four supported browsers.
- Deployed to staging; all earlier sprints' regression tests pass; then released to production behind its feature flag where needed.
- ERD, OpenAPI and runbook are updated.
- Demonstrated at Sprint Review and accepted by the Product Owner.

### 3.5 Priorities and the spill rule

Every story is marked **M** (Must: needed for the Sprint Goal), **S** (Should) or **C** (Could). Work is ordered by this mark within each day plan.

- A story is released whole or not at all. Unfinished work stays behind its feature flag, is switched off in production, and returns to the top of the backlog.
- Requirement IDs are counted as delivered only when their story is Done at Sprint Review.
- A spilled Must story in Sprints 1 to 3 blocks the next release's dependent stories; the Product Owner decides at the D5 inspection.
- Spilled Should and Could stories may slide to a later sprint because every later sprint is additive. Moving anything beyond week 10 requires change control (phased plan, Section 11.4).
- Capacity: reserve 10% of every sprint for defects in the previous release, and 15% in Sprint 4 because it starts right after Phase 1 go-live.

### 3.6 Capacity baseline, ownership and re-planning

The plan is a delivery map, not a promise that every listed story fits into ten weeks. Before each Sprint Planning, the Scrum Master records each member's available person-days after classes, exams, public holidays and standing project work. The team then reserves **20%** of that capacity for integration, testing, review and documentation, plus the defect reserve in Section 3.5. Only the remaining capacity may be committed to new stories.

The eleven-member team should work as four collaborating streams, with shared review and integration rather than isolated hand-offs:

| Stream | Primary responsibilities | Plan tracks |
|---|---|---|
| Platform | backend, database, security, deployment and technical integration | A |
| Experience | frontend, property-management workflows and responsive UI | B |
| Transactions | booking, payments, state transitions and notifications | C |
| Quality and delivery | test design, regression, release evidence and project documentation | all tracks |

The Product Owner commits Must stories first. Should and Could stories enter only when the capacity budget permits. At the Sprint 1 Review, record the number of stories completed, the work that spilled, defects found after the release and actual person-days used. Re-estimate Sprints 2 to 5 before Sprint 2 Planning. If less than 85% of Sprint 1's committed work is Done, remove Could stories first and then move complete Should stories through change control; never recover time by weakening the Definition of Done.

The dated schedule is not approved until this capacity check is complete. In particular, a sprint may not end its release or acceptance work on a public holiday.

---

## 4. The No-Conflict Contract

The rule that keeps Phase 2 from disturbing Phase 1 is applied between every pair of sprints: **sprint N+1 adds to sprint N and never rewrites it.**

### 4.1 Eight rules enforced from Sprint 1

| # | Rule | How it is enforced |
|:-:|------|--------------------|
| C1 | Additive-only schema. No dropped or renamed columns, no new NOT NULL columns without defaults. | Reviewed in every migration; tested by migrating a copy of the previous release. |
| C2 | Reserved migration ranges. Each sprint owns a range of version numbers so two sprints never collide. | Sprint 1: V1_01 to V1_19. Sprint 2: V1_20 to V1_39. Sprint 3: V1_40 to V1_59. Sprint 4: V2_01 to V2_29. Sprint 5: V2_30 to V2_59. |
| C3 | No breaking API changes. New endpoints and optional fields only. | OpenAPI breaking-change check in CI against the previous release tag. |
| C4 | Events are append-only contracts. New event types and optional fields only; consumers ignore unknown fields. | Event schema tests; the Sprint 2 catalogue is frozen (Section 7.5). |
| C5 | Dependencies point downward only, and a sprint depends only on modules from its own or earlier sprints. | Spring Modulith `verify()` fails the build. |
| C6 | Later sprints attach to earlier modules only through the public `api` package, domain events and the eight seams. Edits to earlier modules are limited to defect fixes and the hooks listed in each sprint's hand-off. | Code review checklist; boundary check; diff of earlier modules shown at Sprint Review. |
| C7 | Unfinished or future features are compiled but dark behind feature flags. | Flags live in the `platform_setting` table, off by default in production. |
| C8 | Every release is reversible. Because migrations are additive, the previous application version still runs on the new schema. | Tagged releases, backup before each release, rollback rehearsed on staging. |

### 4.2 Regression chain

Each release runs the complete automated suites of every earlier sprint before it ships, and a failing earlier test blocks the release.

```text
R1 = S1 suite
R2 = S1 + S2 suites
R3 = S1 + S2 + S3 suites + Phase 1 seam tests
R4 = S1..S3 + S4 suites (Phase 1 untouched, boundary check clean)
R5 = S1..S4 + S5 suites + full security re-test
```

### 4.3 Who may call whom

| Sprint | May use | Must not touch |
|:------:|---------|----------------|
| 1 | Shared kernel only | Nothing earlier exists |
| 2 | S1 public APIs and events: catalog, availability, organisation, identity, media, notification, audit | S1 internals |
| 3 | S1 and S2 public APIs and the frozen event catalogue | S1 and S2 internals; no new booking states |
| 4 | Phase 1 public APIs, events and seams (availability reasons, charges, roles, audit entity types, documents, notification registry) | Any Phase 1 module's internals |
| 5 | Phase 1 and Sprint 4 public APIs | Any earlier module's internals |

---

## 5. Decision Gates by Sprint

IDs are from the phased plan (Section 6). **Needed by** is the sprint day on which work stops if the decision is still open. **Proposed default** is what the team builds if no decision arrives; it keeps the sprint moving, is a suggestion for you to confirm, and is not itself a decision.

| ID | Topic | Needed by | Proposed default if undecided |
|----|-------|:---------:|-------------------------------|
| J-06 | Multi-company onboarding and data isolation | Closed (S1) | **Settled:** Yes — `organization` per owner from Day 1 in one shared database, isolated by `organization_id`. |
| P-02 | Unit model (FR-15 versus FR-40) | Closed (S1) | **Settled:** Track each bookable unit individually (with its own calendar and overlap lock), optionally grouped by unit type for display. |
| P-04 | Role model versus BRL-02 | Closed (S1) | **Settled:** Account holds role memberships (Guest + Owner/Staff per organisation or property); BRL-02 reworded. |
| P-08 | Phone verification and SMS provider | Closed (S1) | **Settled:** Integrate a Ghana-supported SMS provider (Arkesel / Hubtel / mNotify) behind `NotificationSender`, with email-only OTP fallback in R1 if sender-ID approval takes past Day 2. |
| P-09 | Token lifecycle | Closed (S1) | **Settled:** Supabase Auth issues 1-hour access JWTs with refresh-token rotation; Spring validates via JWKS and checks active account/membership status on sensitive actions. |
| P-12 | Regulator name for Act 843 and tourism licence documents | Closed (S1) | **Settled:** Reference the Data Protection Commission (DPC) under Act 843 in privacy notices; require Ghana Card + proof of ownership/authorisation + Ghana Tourism Authority (GTA) licence (where applicable). |
| P-03 | Booking states and hold rules | S2 D1 | Add Expired. Pending does not hold the unit; owner acceptance starts the 30-minute window and places the hold; the owner response timeout is a setting; confirming one booking declines overlapping pending requests with a notification. |
| P-10 | Background job hosting | S2 D1 | Non-sleeping hosting tier; expiry job idempotent with catch-up on startup. |
| P-07 | Monetisation split (BR-12) | S2 D1 | Commission and convenience fee in Phase 1; the rest in Sprint 5. |
| J-03 (fees) | Commission and guest convenience-fee rules | S2 D1 | Fees are percentages in platform settings; if rules are late, ship with zero-value fee lines and set the values later. |
| J-03 (payouts) | Payout timing, split payments or escrow | S3 D1 | Pay out after stay completion; verify Paystack Ghana transfer support first. |
| P-06 | Cancellation policy definition | S3 D1 | Platform-defined templates chosen per listing; the percentages and timings must come from the project owner. |
| P-05 | Performance, uptime and compliance targets | S3 D1 | NFR-13 (3 s) as pass or fail and NFR-14 (2 s) as the target; 99.5% uptime target with 99% as the floor; load test to the S1 figure of 1,000 concurrent users; PCI scope confirmed as hosted checkout. |
| Hostel scope | Unit of sale, billing period, agreement, discovery (phased plan Section 5.5) | S4 D8 | Needed to plan Sprint 5. Otherwise Sprint 5 builds a design spike only. |
| J-04 | AI-assisted support (FR-95, FR-96) | S4 D8 | In Phase 2 as allocated (Sprint 5, Could). |
| J-05 | Text-to-speech and icon navigation | S4 D8 | Icon navigation and low-literacy design in Sprint 1; text-to-speech in Sprint 5 (Could). |
| P-11 | Calendar integration boundary (NFR-62) | S4 D8 | NFR-62 stays in Sprint 5 (Could). |
| J-01, J-02, P-01 | Scope, roles, student-hostel deferral | Closed | Decided in the phased plan. |

---

## 6. Sprint 1: Foundation and Verified Owner Listings

| | |
|---|---|
| **Weeks** | Weeks 1-2 (example Mon 16 Nov 2026 to Fri 27 Nov 2026) |
| **Phase and release** | Phase 1, release R1: Owner and administrator release (production, invited pilot owners only) |
| **Modules** | identity, organization, audit, media, notification, catalog, verification, availability (calendar side), admin (basics), platform foundation |
| **Requirement items accepted** | 108 |
| **Decisions needed** | Before D1: P-02, P-04, P-08, P-09, J-06. By D6: P-12. |

**Sprint Goal.** A verified owner can register, create an organisation, add staff, submit verification documents, build a listing with photos and an availability calendar, and an administrator can approve it, all running in production with backups and monitoring.

**Parallel tracks** (for more than one developer; one developer works them in day order)

- Track A: Platform, identity, security, organisation, audit, notification
- Track B: UI shell, media, listings, verification, availability, admin

### 6.1 Sprint backlog

| Story | Epic | Title | Pri | Track | Days | Requirement IDs |
|-------|------|-------|:---:|:-----:|:----:|-----------------|
| S1-01 | Platform foundation | Walking skeleton, CI and module-boundary gate | M | A | D1-D3 | TA-01, TA-02, NFR-45, NFR-46, NFR-47, NFR-48, NFR-52, NFR-54, NFR-55, NFR-56, NFR-57, NFR-58, NFR-63, PD-01, PD-02, PD-07 |
| S1-02 | Platform foundation | Cloud deployment, secrets, backups and monitoring | M | A | D2-D4 | PD-06, PD-10, PD-11, PD-12, TA-11, NFR-27, NFR-42, NFR-43, UR-ON05 |
| S1-03 | UI foundation | Design system and responsive portal shells | M | B | D2-D5 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-07, NFR-09, NFR-10, NFR-12, UR-ON01, BR-10 |
| S1-04 | Identity | Supabase Auth integration, verification, login/logout and JWT validation | M | A | D2-D5 | UR-G01, FR-01, FR-02, FR-03, FR-05, BRL-01, NFR-19, NFR-22, TA-07, TA-08 |
| S1-05 | Identity | Password recovery and profile | M | A | D5-D6 | FR-04, FR-06 |
| S1-06 | Identity and security | Data-driven RBAC and security baseline | M | A | D4-D6 | FR-07, BRL-02, NFR-20, NFR-21, NFR-23, NFR-24, UR-AN01 |
| S1-07 | Organisation | Organisations, memberships and staff permission grants | M | A | D4-D7 | UR-O15, UR-PS01, UR-PSN01, UR-PM03, FR-09, BRL-04, BRL-05, UR-ON02 |
| S1-08 | Audit | Append-only audit trail | S | A | D5-D7 | UR-A07, UR-AN02, NFR-66, BR-11, BRL-19 |
| S1-09 | Media | Supabase Storage uploads, WebP optimisation, generic documents | M | B | D4-D6 | TA-12, TA-13, NFR-17 |
| S1-10 | Notification | Email, SMS, in-app and the event registry | M | A | D5-D7 | FR-68, FR-69, FR-70, FR-71, NFR-60 |
| S1-11 | Privacy | Consent and data-protection controls | S | A | D6-D7 | NFR-31, NFR-32, NFR-35, NFR-36 |
| S1-12 | Verification | Owner onboarding and verification | M | B | D6-D8 | UR-O01, FR-08, NFR-28, NFR-34, TA-09 |
| S1-13 | Catalog | Properties, units, rates and listing lifecycle | M | B | D4-D8 | FR-11, FR-12, FR-13, FR-14, FR-15, FR-16, FR-17, FR-22, BRL-06, BR-03, BR-02 |
| S1-14 | Availability | Availability calendar and owner blocks | M | B | D7-D8 | UR-O02, UR-O03, FR-18, FR-39 |
| S1-15 | Admin | Approval queue and publishing | M | B | D7-D8 | UR-A02, FR-21, FR-88 |
| S1-16 | Admin | User management, platform settings and dashboard | S | B | D6-D8 | UR-A01, FR-87, UR-A08, FR-92, FR-86 |
| S1-17 | Release | Stabilise, regression and release R1 | M | A | D9-D10 | (release and quality work; no new IDs) |

### 6.2 Day-by-day plan

| Story | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | D10 |
|-------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| S1-01 Walking skeleton, CI and module-boundary gate | ■ | ■ | ■ |  |  |  |  |  |  |  |
| S1-02 Cloud deployment, secrets, backups and monitoring |  | ■ | ■ | ■ |  |  |  |  |  |  |
| S1-03 Design system and responsive portal shells |  | ■ | ■ | ■ | ■ |  |  |  |  |  |
| S1-04 Supabase Auth integration, verification, login/logout and JWT validation |  | ■ | ■ | ■ | ■ |  |  |  |  |  |
| S1-06 Data-driven RBAC and security baseline |  |  |  | ■ | ■ | ■ |  |  |  |  |
| S1-07 Organisations, memberships and staff permission grants |  |  |  | ■ | ■ | ■ | ■ |  |  |  |
| S1-09 Supabase Storage uploads, WebP optimisation, generic documents |  |  |  | ■ | ■ | ■ |  |  |  |  |
| S1-13 Properties, units, rates and listing lifecycle |  |  |  | ■ | ■ | ■ | ■ | ■ |  |  |
| S1-05 Password recovery and profile |  |  |  |  | ■ | ■ |  |  |  |  |
| S1-08 Append-only audit trail |  |  |  |  | ■ | ■ | ■ |  |  |  |
| S1-10 Email, SMS, in-app and the event registry |  |  |  |  | ■ | ■ | ■ |  |  |  |
| S1-11 Consent and data-protection controls |  |  |  |  |  | ■ | ■ |  |  |  |
| S1-12 Owner onboarding and verification |  |  |  |  |  | ■ | ■ | ■ |  |  |
| S1-16 User management, platform settings and dashboard |  |  |  |  |  | ■ | ■ | ■ |  |  |
| S1-14 Availability calendar and owner blocks |  |  |  |  |  |  | ■ | ■ |  |  |
| S1-15 Approval queue and publishing |  |  |  |  |  |  | ■ | ■ |  |  |
| S1-17 Stabilise, regression and release R1 |  |  |  |  |  |  |  |  | ■ | ■ |
| Sprint Planning | ■ | | | | | | | | | |
| Daily Scrum | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ |
| Feature freeze | | | | | | | | ■ | | |
| Staging regression and release | | | | | | | | | ■ | |
| Review, retrospective, pre-planning | | | | | | | | | | ■ |

### 6.3 Story detail and tasks

**S1-01 Walking skeleton, CI and module-boundary gate** (Pri M, track A, D1 to D3)

- *Done when:* Empty app builds, tests and deploys from CI; the build fails if a module imports another module's internals.
- *Database:* Supabase PostgreSQL with one unexposed schema per module; Flyway is the only application-schema migration authority and establishes the S1 range V1_01 to V1_19; `btree_gist` extension; ERD for the S1 modules reviewed against the eight seams. React has no direct Data API access to FindStay business tables.
- *API:* Spring Boot 3 on JDK 21; Spring Modulith `verify()` in CI; shared kernel (Money in pesewas, UTC timestamptz with Ghana-time rendering, IDs, error model, domain events, scheduler); OpenAPI per module.
- *UI:* Vite + React + Tailwind app; portal router for guest, owner and admin; one feature folder per backend module.
- *Tests:* Testcontainers PostgreSQL harness; requirement-tag annotation (`@Req("FR-40")`) on tests; docs folder (architecture note, ERD, OpenAPI).

**S1-02 Cloud deployment, secrets, backups and monitoring** (Pri M, track A, D2 to D4)

- *Done when:* The walking skeleton is live on cloud hosting; a backup is restored into a scratch database and timed.
- *Database:* Supabase Pro production project with daily automated backups; documented restore procedure; restore drill on D4.
- *API:* Spring Boot API on Render, Supabase PostgreSQL, frontend on Cloudflare Workers Static Assets; Cloudflare DNS, CDN, WAF and Turnstile protect public entry points; every secret in environment settings; `/health` endpoint; structured error logging.
- *Tests:* Uptime ping and alert on health failure; hosting tier confirmed not to sleep (P-10); no secret found by a repository scan.

**S1-03 Design system and responsive portal shells** (Pri M, track B, D2 to D5)

- *Done when:* Owner and admin shells work at 360 px, tablet and desktop with consistent navigation and feedback messages.
- *UI:* Tailwind tokens; contrast-safe palette; icon plus label navigation; accessible form controls; toast, empty and error states; owner portal and admin portal shells.
- *Tests:* Chrome, Edge, Firefox and Safari matrix; no horizontal scroll at 360 px; accessibility lint; throttled 3G smoke test.

**S1-04 Supabase Auth integration, email verification, login/logout and JWT validation** (Pri M, track A, D2 to D5)

- *Done when:* A new user registers, completes Supabase email confirmation (or phone OTP if P-08 selects a supported SMS provider), logs in and logs out through Supabase Auth; protected Spring endpoints reject anonymous or invalid JWTs.
- *Database:* `user_profile` stores the immutable Supabase user ID and FindStay profile data; roles seeded: Guest, Owner/Manager, Property Staff, Administrator. No application credential, OTP-challenge or token-store tables are created.
- *API:* Spring Security OAuth2 Resource Server validates Supabase JWTs from JWKS; `GET/PATCH /me` provisions and updates the local profile. Configure the Supabase Site URL and allow-listed redirect URLs for the Cloudflare environments. Spring has no registration, password, reset or refresh-token endpoints.
- *UI:* React screens use `@supabase/supabase-js` with the project publishable key for registration, email confirmation, optional phone OTP, login, logout and password recovery; Cloudflare Turnstile protects sign-up and sign-in.
- *Tests:* Email-confirmation and sign-in flows (and phone OTP if enabled); malformed, expired and wrong-issuer JWT rejection; anonymous access rejected on every protected route; no Supabase secret or service-role key is present in browser assets.

**S1-05 Password recovery and profile** (Pri M, track A, D5 to D6)

- *Done when:* A user recovers a password through a verified channel and edits profile fields they are authorised to edit.
- *API:* `GET/PATCH /me` only. Supabase Auth handles request-reset and confirm-reset directly from the React UI.
- *UI:* Forgot-password flow; profile page.
- *Tests:* Reset link single-use and time-limited; cannot edit another user's profile.

**S1-06 Data-driven RBAC and security baseline** (Pri M, track A, D4 to D6)

- *Done when:* Every endpoint is permission-guarded from tables; an administrator-only route is unreachable to others.
- *Database:* role, permission, role_permission; membership-based role model if P-04 is confirmed (BRL-02 reworded).
- *API:* `@RequiresPermission` guard; HTTPS/TLS only; input validation, output encoding, parameterised queries; object-level access checks.
- *Tests:* Role-by-endpoint matrix; direct-object-reference probes; SQL injection and XSS probes.

**S1-07 Organisations, memberships and staff permission grants** (Pri M, track A, D4 to D7)

- *Done when:* An owner gets an organisation on onboarding, invites staff, grants and revokes per-property permissions, and sees only their own data.
- *Database:* organization, membership, membership_permission; `organization_id` convention on owned tables.
- *API:* Invite, accept, grant, revoke; shared `OrgScope` filter applied to all owned-data queries.
- *UI:* Staff management screen in the owner portal.
- *Tests:* Cross-organisation isolation: owner A cannot read, update or list owner B's records.

**S1-08 Append-only audit trail** (Pri S, track A, D5 to D7)

- *Done when:* Admin and verification actions are recorded with action, user, date/time and entity; records cannot be edited or deleted.
- *Database:* audit_log with `entity_type` and `entity_id`; application role has INSERT and SELECT only.
- *API:* `AuditRecorder` API for all modules; admin audit viewer with filters.
- *Tests:* Update and delete attempts fail at database level; suspension and restoration appear in the log.

**S1-09 Supabase Storage uploads, WebP optimisation, generic documents** (Pri M, track B, D4 to D6)

- *Done when:* React uploads through Supabase Storage; approved property photos are delivered from the public `property-images` bucket as optimised WebP, while verification and tenancy documents remain private.
- *Database:* media_asset; document(owner_type, owner_id, ...).
- *API:* Spring creates and authorises media records, validates metadata and promotes approved images from a private submission path to the public bucket. It never proxies file bytes. Storage policies restrict each user to their own upload path, and private documents are retrieved by signed URL.
- *Tests:* Storage-policy isolation, oversize and wrong-type rejection, signed-URL expiry and image payload size on a throttled connection.

**S1-10 Email, SMS, in-app and the event registry** (Pri M, track A, D5 to D7)

- *Done when:* Account and verification-status events reach users by email, SMS (if provider chosen) and in-app. Supabase Auth owns authentication email delivery.
- *Database:* notification, notification_template, notification_preference.
- *API:* Dispatcher with channel adapters (email, SMS) behind interfaces; templates by event type.
- *Tests:* Delivery failure is logged and retried; provider adapter can be swapped without touching callers.

**S1-11 Consent and data-protection controls** (Pri S, track A, D6 to D7)

- *Done when:* Consent is captured at registration, only necessary fields are collected, and personal data is visible only to authorised users.
- *Database:* consent_record on user_account.
- *UI:* Consent text and privacy notice at registration.
- *Tests:* Field-by-field data-minimisation review; authorised-only access tests on personal and financial data.

**S1-12 Owner onboarding and verification** (Pri M, track B, D6 to D8)

- *Done when:* An owner submits identity and property documents, tracks status, and sensitive identity data is encrypted at rest.
- *Database:* verification_case, verification_document, review_decision; encrypted columns for identity numbers (Ghana Card).
- *API:* Submit, resubmit after correction, status query.
- *UI:* Onboarding wizard and status tracker.
- *Tests:* Encrypted at rest verified in the database; documents unreadable to non-reviewers; licence document list per P-12.

**S1-13 Properties, units, rates and listing lifecycle** (Pri M, track B, D4 to D8)

- *Done when:* A verified owner creates, edits and pauses a listing with units, photos, rates, amenities and house rules; incomplete listings cannot be submitted.
- *Database:* property, unit, amenity, listing, rate_plan (NIGHTLY only); Takoradi areas and campuses seeded.
- *API:* CRUD with validation; submit-for-approval gate; `CatalogQuery` read API.
- *UI:* Listing editor with photo upload and preview.
- *Tests:* Required-field validation; only verified owners can create; hospitality types supported: hotels, budget hotels, guesthouses, serviced apartments.

**S1-14 Availability calendar and owner blocks** (Pri M, track B, D7 to D8)

- *Done when:* An owner manages the calendar per unit; overlapping active blocks are rejected by the database.
- *Database:* availability_block with reason lookup and exclusion constraint.
- *API:* Create, remove and list blocks; calendar read API.
- *UI:* Calendar view in the owner portal.
- *Tests:* Concurrent block attempts: exactly one succeeds.

**S1-15 Approval queue and publishing** (Pri M, track B, D7 to D8)

- *Done when:* An administrator approves, rejects, suspends, restores or requests corrections; only approved listings become Published.
- *Database:* listing status history.
- *API:* Decision endpoints with mandatory reason; publish on approval.
- *UI:* Approval queue and review screen.
- *Tests:* Unapproved listing cannot be published; every decision is audited.

**S1-16 User management, platform settings and dashboard** (Pri S, track B, D6 to D8)

- *Done when:* An administrator creates, suspends and restores users, edits platform settings, and sees a basic dashboard.
- *Database:* platform_setting.
- *API:* User admin and settings endpoints.
- *UI:* Admin dashboard, users table, settings page.
- *Tests:* Suspended user cannot log in; settings changes are audited.

**S1-17 Stabilise, regression and release R1** (Pri M, track A, D9 to D10)

- *Done when:* R1 is tagged and deployed to production; Sprint Review accepted; retrospective actions recorded.
- *Tests:* Staging regression and UAT with two pilot owners; production release; smoke test; backup taken before release.

### 6.4 Demo script for Sprint Review

1. An owner registers with email, completes the Supabase email-confirmation flow, and logs in through the FindStay UI.
2. The owner's organisation is created automatically; the owner invites a staff member and grants permission for one property only.
3. The owner uploads identity and property documents; an administrator sees the case in the approval queue.
4. The owner creates a property with two units, photos (served as WebP), rates, amenities and house rules, and blocks some dates on the calendar.
5. The administrator approves the listing; the status changes to Published and the owner receives an email.
6. The administrator suspends and restores a user; both actions appear in the audit log.
7. A second owner cannot see the first owner's data. The deployed system passes a restore drill from last night's backup.

### 6.5 Hand-off: what this sprint builds in so the next sprint needs no edits

- `availability_block` carries a `reason` lookup (only OWNER_BLOCK active now) and a PostgreSQL exclusion constraint on (unit, date range) for active blocks. Sprint 2 adds the reasons HOLD and BOOKING by data migration, with no code change to this module.
- A `CatalogQuery` public API returns everything search needs (property, unit, amenities, price, location, status). Sprint 2 reads it and never touches catalog internals.
- `rate_plan.billing_period` is a lookup table with only NIGHTLY active. Sprints 4 and 5 insert MONTHLY, TERM and ACADEMIC_YEAR rows.
- Notification templates are keyed by event type and registered by migration. Sprint 2 registers booking and payment event types the same way.
- Audit stores `entity_type` and `entity_id` generically; any later module records actions through the same `AuditRecorder` API.
- Roles and permissions are rows, not enums. Permission codes are namespaced (`listing.*`, `booking.*`, `payment.*`). Later sprints seed their own codes.
- `platform_setting` (key-value) and a feature-flag table exist, so fees, windows and dark launches need no new table later.
- Shared `OrgScope` filter, `Money` (pesewas), time kernel, idempotent scheduler and domain-event bus are ready for reuse.

### 6.6 Sprint risks

- Largest platform setup sprint. If the walking skeleton is not deployed by D3, stop adding features until it is.
- SMS provider choice (P-08) can delay OTP. Fallback: email-only OTP in R1; FR-70 (SMS) moves to Sprint 2 through change control.
- Supabase Storage quotas and Render's non-sleeping hosting tier must be checked on D2.

---

## 7. Sprint 2: Search, Book and Pay

| | |
|---|---|
| **Weeks** | Weeks 3-4 (example Mon 30 Nov 2026 to Fri 11 Dec 2026) |
| **Phase and release** | Phase 1, release R2: Guest release (production, invited pilot; refunds handled manually by an administrator until Sprint 3) |
| **Modules** | search, availability (holds and overlap rules), booking, payments, notification (booking and payment events), guest portal |
| **Requirement items accepted** | 90 |
| **Decisions needed** | Before D1: P-03, P-10, P-07, J-03 (commission and convenience-fee rules only). Paystack test and live accounts ready by D2. |

**Sprint Goal.** A guest finds a verified listing, requests a booking, the owner accepts, the guest pays with Mobile Money or card through Paystack, the booking is confirmed only after verified payment, and the guest gets a QR voucher.

**Parallel tracks** (for more than one developer; one developer works them in day order)

- Track A: Discovery and guest portal
- Track B: Booking and availability
- Track C: Payments

### 7.1 Sprint backlog

| Story | Epic | Title | Pri | Track | Days | Requirement IDs |
|-------|------|-------|:---:|:-----:|:----:|-----------------|
| S2-01 | Discovery | Search, location and campus search, sorting | M | A | D1-D3 | UR-G02, FR-23, FR-24, BR-04, FR-35, BR-01 |
| S2-02 | Discovery | Filters: type, price, amenities, capacity, dates, rating | M | A | D2-D4 | UR-G03, FR-25, FR-26, FR-27, FR-28, FR-29, FR-30 |
| S2-03 | Discovery | Public listing page, verification badge, map and distance | M | A | D3-D5 | FR-31, FR-34, FR-20, BRL-03, BR-05, UR-GN03 |
| S2-04 | Guest portal | Guest portal shell and mobile-first performance | M | A | D1-D3 | UR-GN01, UR-GN02, UR-GN04, NFR-13, NFR-14, NFR-16, TA-03 |
| S2-05 | Booking | Booking request, validation and price | M | B | D1-D4 | UR-G07, FR-36, FR-37, FR-38 |
| S2-06 | Booking | Owner and staff review; booking dashboards | M | B | D4-D6 | UR-O04, FR-42, UR-O06, FR-47, FR-48, UR-PS02, UR-PM02 |
| S2-07 | Booking | Status machine, history and payment-window expiry | M | B | D3-D6 | FR-44, BRL-08, BRL-09, FR-46 |
| S2-08 | Availability | Holds, overlap prevention and unit status | M | B | D2-D5 | FR-40, FR-41, FR-45, BRL-07, BR-06, BRL-10, FR-19, NFR-18, NFR-38 |
| S2-09 | Payments | Paystack checkout with Mobile Money and cards | M | C | D2-D6 | FR-51, FR-52, FR-53, TA-04, NFR-59, NFR-33, TA-10, NFR-26, UR-G08 |
| S2-10 | Payments | Charges, ledger, fee lines and transaction records | M | C | D3-D6 | FR-54, FR-55, FR-64, TA-06, BR-07, BR-12, NFR-51, NFR-40, NFR-37 |
| S2-11 | Payments | Signed webhooks, idempotency, duplicate rejection | M | C | D5-D7 | FR-56, FR-57, BRL-15, TA-05, NFR-25, NFR-39, NFR-50 |
| S2-12 | Stay | Check-in and check-out, vouchers with QR | S | B | D6-D8 | UR-G10, FR-50, UR-O07, UR-PS03, FR-49, BRL-11, UR-PSN02 |
| S2-13 | Notification | Booking and payment notifications; booking history | S | B | D6-D8 | UR-G12, FR-66, FR-67, UR-G16, UR-AN03 |
| S2-14 | Quality | End-to-end core-flow tests | M | A | D7-D9 | PD-03, PD-08, NFR-49 |
| S2-15 | Release | Stabilise, regression and release R2 | M | A | D9-D10 | (release and quality work; no new IDs) |

### 7.2 Day-by-day plan

| Story | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | D10 |
|-------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| S2-01 Search, location and campus search, sorting | ■ | ■ | ■ |  |  |  |  |  |  |  |
| S2-04 Guest portal shell and mobile-first performance | ■ | ■ | ■ |  |  |  |  |  |  |  |
| S2-05 Booking request, validation and price | ■ | ■ | ■ | ■ |  |  |  |  |  |  |
| S2-02 Filters: type, price, amenities, capacity, dates, rating |  | ■ | ■ | ■ |  |  |  |  |  |  |
| S2-08 Holds, overlap prevention and unit status |  | ■ | ■ | ■ | ■ |  |  |  |  |  |
| S2-09 Paystack checkout with Mobile Money and cards |  | ■ | ■ | ■ | ■ | ■ |  |  |  |  |
| S2-03 Public listing page, verification badge, map and distance |  |  | ■ | ■ | ■ |  |  |  |  |  |
| S2-07 Status machine, history and payment-window expiry |  |  | ■ | ■ | ■ | ■ |  |  |  |  |
| S2-10 Charges, ledger, fee lines and transaction records |  |  | ■ | ■ | ■ | ■ |  |  |  |  |
| S2-06 Owner and staff review; booking dashboards |  |  |  | ■ | ■ | ■ |  |  |  |  |
| S2-11 Signed webhooks, idempotency, duplicate rejection |  |  |  |  | ■ | ■ | ■ |  |  |  |
| S2-12 Check-in and check-out, vouchers with QR |  |  |  |  |  | ■ | ■ | ■ |  |  |
| S2-13 Booking and payment notifications; booking history |  |  |  |  |  | ■ | ■ | ■ |  |  |
| S2-14 End-to-end core-flow tests |  |  |  |  |  |  | ■ | ■ | ■ |  |
| S2-15 Stabilise, regression and release R2 |  |  |  |  |  |  |  |  | ■ | ■ |
| Sprint Planning | ■ | | | | | | | | | |
| Daily Scrum | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ |
| Feature freeze | | | | | | | | ■ | | |
| Staging regression and release | | | | | | | | | ■ | |
| Review, retrospective, pre-planning | | | | | | | | | | ■ |

### 7.3 Story detail and tasks

**S2-01 Search, location and campus search, sorting** (Pri M, track A, D1 to D3)

- *Done when:* A guest finds approved listings by keyword, town, area, campus or distance, sorted, with a helpful message when nothing matches.
- *Database:* Search read model over catalog (read-only), including nullable rating columns.
- *API:* Search endpoint with pagination and sorting; reads only `CatalogQuery` and the availability read API.
- *UI:* Guest search page and results list.
- *Tests:* Only Published listings appear; empty-result message; response time measured.

**S2-02 Filters: type, price, amenities, capacity, dates, rating** (Pri M, track A, D2 to D4)

- *Done when:* Every filter works alone and combined; date filtering uses the availability read API; the rating filter works as soon as ratings exist.
- *API:* Filter-provider interface with one provider per filter.
- *UI:* Filter panel (mobile drawer).
- *Tests:* Filter combination matrix; date filter excludes held and booked units.

**S2-03 Public listing page, verification badge, map and distance** (Pri M, track A, D3 to D5)

- *Done when:* A guest sees photos, description, prices, unit options, facilities, house rules, availability and verification status; only approved listings are reachable.
- *API:* Public listing detail endpoint; distance calculation.
- *UI:* Listing detail page with map location and distance; no personal or payment data exposed.
- *Tests:* Unapproved or paused listing returns not found; privacy review of the public payload.

**S2-04 Guest portal shell and mobile-first performance** (Pri M, track A, D1 to D3)

- *Done when:* The guest portal works without training on a low-end phone over 3G; search returns within the target.
- *UI:* Guest portal shell on the S1 design system; image lazy-loading; small bundles.
- *Tests:* Throttled 3G test; search timing against NFR-13 (3 s) and NFR-14 (2 s) per the P-05 default.

**S2-05 Booking request, validation and price** (Pri M, track B, D1 to D4)

- *Done when:* A guest submits a request for an available unit and date range; capacity and availability are validated; the total is calculated.
- *Database:* booking, stay; V1_20 onward.
- *API:* Create booking request; price calculation from rate plan and nights.
- *UI:* Booking form and summary.
- *Tests:* Capacity and date validation; price calculation cases (one night, multi-night, boundary dates).

**S2-06 Owner and staff review; booking dashboards** (Pri M, track B, D4 to D6)

- *Done when:* Owners and authorised staff accept or decline requests; guests, owners and staff see upcoming, active, completed and cancelled bookings.
- *API:* Accept and decline with reason; dashboards by role and organisation.
- *UI:* Owner booking dashboard; guest bookings list.
- *Tests:* Staff see only authorised properties; cross-organisation isolation.

**S2-07 Status machine, history and payment-window expiry** (Pri M, track B, D3 to D6)

- *Done when:* Status flows Pending, Awaiting Payment, Confirmed (only after verified payment), with history; unpaid bookings expire after 30 minutes.
- *Database:* booking_status_history.
- *API:* State machine with all statuses and transitions; idempotent expiry job that also catches up after a missed run.
- *Tests:* Illegal transitions rejected; expiry job run twice produces no change; missed-run catch-up.

**S2-08 Holds, overlap prevention and unit status** (Pri M, track B, D2 to D5)

- *Done when:* Concurrent requests cannot double-book; declined, cancelled and expired bookings release the unit; unit status is derived from blocks.
- *Database:* HOLD and BOOKING reasons added by data migration; no schema change to availability.
- *API:* Hold on acceptance, release on decline, cancel or expiry; derived unit status (available, booked, owner-blocked, owner-marked maintenance).
- *Tests:* Parallel requests for the same unit and dates: one wins; load test on the booking path.

**S2-09 Paystack checkout with Mobile Money and cards** (Pri M, track C, D2 to D6)

- *Done when:* A guest pays with MTN Mobile Money, Telecel Cash, AT Money or a card using hosted checkout; no card data touches our system.
- *Database:* charge, payment_transaction.
- *API:* Initialise transaction, verify transaction; gateway adapter behind an interface.
- *UI:* Pay screen and result screen.
- *Tests:* Paystack test mode for each channel; no card data found in logs or database.

**S2-10 Charges, ledger, fee lines and transaction records** (Pri M, track C, D3 to D6)

- *Done when:* A booking creates charges; payments settle charges; every movement is an append-only ledger entry in GHS with commission and convenience-fee lines.
- *Database:* ledger_entry (append-only), fee lines, transaction references and timestamps in pesewas.
- *API:* Create charge from booking event; settle charge; fee calculation from platform settings.
- *Tests:* Ledger balances after every scenario; payments never reference bookings directly; a charge can be created without a booking (seam test).

**S2-11 Signed webhooks, idempotency, duplicate rejection** (Pri M, track C, D5 to D7)

- *Done when:* Only validly signed callbacks are accepted; duplicate or failed notifications never create duplicate confirmed bookings or payments.
- *Database:* webhook_event with unique provider event reference.
- *API:* HMAC-SHA512 signature validation; handler registry by event type; idempotent processing.
- *Tests:* Forged signature rejected; replayed webhook ignored; out-of-order and failed events.

**S2-12 Check-in and check-out, vouchers with QR** (Pri S, track B, D6 to D8)

- *Done when:* Staff record check-in and check-out on quick front-desk screens; a booking becomes Completed only after check-out; guests download a QR voucher.
- *API:* Check-in, check-out, voucher generation.
- *UI:* Front-desk screens; voucher page.
- *Tests:* Cannot complete before the stay ends or without check-out; QR resolves to the correct booking.

**S2-13 Booking and payment notifications; booking history** (Pri S, track B, D6 to D8)

- *Done when:* Guests and owners are notified of booking and payment changes; account page shows booking history; failed payments or notifications are flagged to administrators.
- *API:* Event subscribers registered through the event registry; failure alerts.
- *UI:* Booking history in the account page.
- *Tests:* Every status change produces the expected notification; delivery failure raises an admin alert.

**S2-14 End-to-end core-flow tests** (Pri M, track A, D7 to D9)

- *Done when:* Authentication, authorisation, search and filtering, booking-conflict prevention and payment verification and timeout are covered by automated tests; property, booking and financial data stay consistent.
- *Tests:* Scripted end-to-end: search to voucher; reconciliation of ledger against bookings.

**S2-15 Stabilise, regression and release R2** (Pri M, track A, D9 to D10)

- *Done when:* R2 is tagged and deployed; Sprint 1 regression suite is green; Sprint Review accepted.
- *Tests:* Staging regression including all S1 tests; invited-pilot guests; manual-refund runbook written; backup before release.

### 7.4 Demo script for Sprint Review

1. A guest searches by campus or area, filters by price, type, capacity, amenities and dates, and sorts the results.
2. The guest opens a listing: photos, rules, availability, verification status, map location and distance.
3. The guest requests a booking; the total is calculated; the owner accepts it; status becomes Awaiting Payment and the unit is held.
4. The guest pays with Mobile Money and then separately with a card (test mode); the booking becomes Confirmed only after the webhook is verified.
5. The same webhook is replayed; nothing is processed twice.
6. An unpaid booking is auto-cancelled when the 30-minute window ends and the unit becomes available again.
7. Staff record check-in and check-out; the booking becomes Completed; the guest downloads a QR voucher.

### 7.5 Hand-off: what this sprint builds in so the next sprint needs no edits

- The booking state machine contains every status (Pending, Awaiting Payment, Confirmed, Cancelled, Completed, Declined, Expired) and every transition, including Confirmed to Cancelled, which stays behind the flag `booking.cancel_confirmed_enabled` until Sprint 3. Sprint 3 adds policy and refunds without changing states or schema.
- The event catalogue is frozen here: BookingRequested, BookingAccepted, BookingDeclined, BookingExpired, BookingConfirmed, BookingCancelled, BookingCheckedIn, BookingCheckedOut, BookingCompleted, PaymentSucceeded, PaymentFailed. Sprint 3 only subscribes.
- Charges, payments and the append-only ledger support fee lines and reversing entries. Ledger entries carry organization, property and booking references so finance and reporting need no change in Sprint 2 code.
- The webhook handler has a registry by event type (charge, refund, transfer). Signature check and duplicate rejection are in the core; Sprint 3 adds refund and transfer handlers only.
- The search read model already has nullable `rating_avg` and `review_count`, and a filter-provider interface; reviews populate the columns in Sprint 3 and hostel filters register in Sprint 5.
- Bookings expose the check-out timestamp and Completed status that review eligibility needs.
- Live payments are behind `payments.live_mode`; R2 runs invited-pilot only.

### 7.6 Sprint risks

- Highest-risk sprint (concurrency, Paystack, scheduler). Payments track starts D2 and webhooks must be demoable by D7.
- J-03 fee rules must be decided before D1; otherwise ship with a zero fee line and platform settings, then switch on by setting (no code change).
- Real money in R2 without automated refunds: keep invite-only and keep the manual-refund runbook until Sprint 3.

---

## 8. Sprint 3: Operate, Trust and Go-Live

| | |
|---|---|
| **Weeks** | Weeks 5-6 (example Mon 14 Dec 2026 to Fri 25 Dec 2026) |
| **Phase and release** | Phase 1, release R3: Phase 1 public launch (production, open to real users) |
| **Modules** | booking (cancellation), payments (refunds, payouts, reconciliation), finance, messaging, review, support, reporting, admin (moderation), search (favourites, compare), audit and notification completion, platform hardening |
| **Requirement items accepted** | 79 |
| **Decisions needed** | Before D1: J-03 (payout timing, split or escrow), P-06 (cancellation policy), P-05 (targets). By D4: PCI scope confirmed with Paystack hosted checkout. |

**Sprint Goal.** Phase 1 is complete: cancellations and refunds, payouts, owner finance, messaging, reviews, complaints and disputes, reports and moderation all work, the platform is hardened, and the Phase 1 exit checklist is passed.

**Parallel tracks** (for more than one developer; one developer works them in day order)

- Track A: Money: cancellation, refunds, payouts, reconciliation, finance
- Track B: Trust: reviews, support, messaging, moderation, notifications, audit
- Track C: Read side and hardening: reports, favourites, 2FA, load test, UAT

### 8.1 Sprint backlog

| Story | Epic | Title | Pri | Track | Days | Requirement IDs |
|-------|------|-------|:---:|:-----:|:----:|-----------------|
| S3-01 | Cancellation and refunds | Cancellation, modification and refund flow | M | A | D1-D4 | UR-G09, UR-O05, FR-43, FR-58, BRL-14 |
| S3-02 | Payouts | Owner payouts and settlement | M | A | D2-D5 | UR-O09, FR-63 |
| S3-03 | Reconciliation | Payment reconciliation and admin transaction management | S | A | D4-D6 | FR-59, UR-A05, FR-89 |
| S3-04 | Finance | Income, expenses and net profit | M | A | D1-D5 | UR-O08, UR-O10, UR-O11, FR-60, FR-61, FR-62, BR-08, BRL-16, BRL-17, UR-ON03, NFR-08, NFR-11 |
| S3-05 | Messaging | In-app enquiries and chat | S | B | D1-D3 | UR-G11, UR-O13, UR-PS04, FR-65 |
| S3-06 | Review | Reviews, owner responses and moderation | M | B | D2-D5 | UR-G13, UR-O14, FR-73, FR-74, FR-75, BRL-12, BRL-13, UR-A03, FR-90 |
| S3-07 | Support | Complaints, disputes, listing reports, oversight | M | B | D3-D6 | UR-G14, UR-G15, UR-O16, UR-A04, UR-A09, FR-76, FR-77, FR-78, FR-79, FR-80, FR-91, BR-09 |
| S3-08 | Discovery | Detail with reviews, favourites, compare, recently viewed | C | C | D1-D3 | UR-G04, UR-G05, UR-G06, FR-32, FR-33 |
| S3-09 | Reporting | Dashboards, date-filtered reports and exports | S | C | D5-D8 | UR-O12, UR-A06, FR-81, FR-82, FR-83, FR-84, FR-85, FR-94, UR-ON04 |
| S3-10 | Notification | Reminders, announcements and complete status coverage | S | B | D5-D6 | FR-72, BRL-18 |
| S3-11 | Audit | Audit coverage for booking, financial and admin actions | M | B | D6-D8 | FR-93, NFR-64, NFR-65, BRL-20, NFR-53 |
| S3-12 | Security | Optional two-factor authentication | C | C | D6-D7 | FR-10, NFR-29 |
| S3-13 | Hardening | Performance, load, uptime, recovery and PCI scope | M | C | D6-D9 | NFR-15, NFR-30, NFR-41, NFR-44, UR-GN05 |
| S3-14 | Release | UAT, security testing and Phase 1 exit | M | A | D8-D10 | PD-04, PD-05, PD-09, PD-13 |

### 8.2 Day-by-day plan

| Story | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | D10 |
|-------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| S3-01 Cancellation, modification and refund flow | ■ | ■ | ■ | ■ |  |  |  |  |  |  |
| S3-04 Income, expenses and net profit | ■ | ■ | ■ | ■ | ■ |  |  |  |  |  |
| S3-05 In-app enquiries and chat | ■ | ■ | ■ |  |  |  |  |  |  |  |
| S3-08 Detail with reviews, favourites, compare, recently viewed | ■ | ■ | ■ |  |  |  |  |  |  |  |
| S3-02 Owner payouts and settlement |  | ■ | ■ | ■ | ■ |  |  |  |  |  |
| S3-06 Reviews, owner responses and moderation |  | ■ | ■ | ■ | ■ |  |  |  |  |  |
| S3-07 Complaints, disputes, listing reports, oversight |  |  | ■ | ■ | ■ | ■ |  |  |  |  |
| S3-03 Payment reconciliation and admin transaction management |  |  |  | ■ | ■ | ■ |  |  |  |  |
| S3-09 Dashboards, date-filtered reports and exports |  |  |  |  | ■ | ■ | ■ | ■ |  |  |
| S3-10 Reminders, announcements and complete status coverage |  |  |  |  | ■ | ■ |  |  |  |  |
| S3-11 Audit coverage for booking, financial and admin actions |  |  |  |  |  | ■ | ■ | ■ |  |  |
| S3-12 Optional two-factor authentication |  |  |  |  |  | ■ | ■ |  |  |  |
| S3-13 Performance, load, uptime, recovery and PCI scope |  |  |  |  |  | ■ | ■ | ■ | ■ |  |
| S3-14 UAT, security testing and Phase 1 exit |  |  |  |  |  |  |  | ■ | ■ | ■ |
| Sprint Planning | ■ | | | | | | | | | |
| Daily Scrum | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ |
| Feature freeze | | | | | | | | ■ | | |
| Staging regression and release | | | | | | | | | ■ | |
| Review, retrospective, pre-planning | | | | | | | | | | ■ |

### 8.3 Story detail and tasks

**S3-01 Cancellation, modification and refund flow** (Pri M, track A, D1 to D4)

- *Done when:* Guests and authorised representatives modify or cancel under the recorded policy; refunds are never automatic and follow the policy.
- *Database:* cancellation_policy (per P-06), refund.
- *API:* Enable `booking.cancel_confirmed_enabled`; refund request, approval and processing through the Paystack refund handler.
- *UI:* Cancel and modify screens; refund request.
- *Tests:* Policy cases (full, partial, none); refund never issued without approval; ledger reversal balances.

**S3-02 Owner payouts and settlement** (Pri M, track A, D2 to D5)

- *Done when:* Owners receive payouts for completed transactions according to the J-03 decision.
- *Database:* payout.
- *API:* Payout scheduling after stay completion (default) and Paystack transfer handler.
- *UI:* Payout status for owners.
- *Tests:* Payout only for Completed stays; failed transfer retried safely; duplicate transfer events ignored.

**S3-03 Payment reconciliation and admin transaction management** (Pri S, track A, D4 to D6)

- *Done when:* Administrators and owners reconcile payments against the ledger; administrators manage transaction records and refund processes.
- *API:* Reconciliation job and report; admin transaction and refund views.
- *UI:* Reconciliation screen; admin transaction table.
- *Tests:* Planted mismatch is detected and reported.

**S3-04 Income, expenses and net profit** (Pri M, track A, D1 to D5)

- *Done when:* Confirmed booking payments are recorded as income per property automatically; authorised users record expenses by category; net profit is correct and readable on a phone.
- *Database:* expense, expense_category, income_record(source_type).
- *API:* Income from BookingConfirmed and ledger events; expense CRUD with permissions.
- *UI:* Owner finance pages in plain, readable format.
- *Tests:* Net profit equals income minus expenses across scenarios; unauthorised expense edits rejected; screens readable at 360 px.

**S3-05 In-app enquiries and chat** (Pri S, track B, D1 to D3)

- *Done when:* Guests send enquiries and chat with authorised property representatives in the app.
- *Database:* conversation, message.
- *API:* Conversation and message endpoints with authorisation.
- *UI:* Chat on the listing page and in owner portal inbox.
- *Tests:* Only participants and authorised staff can read a thread.

**S3-06 Reviews, owner responses and moderation** (Pri M, track B, D2 to D5)

- *Done when:* One review per completed booking; owners respond; administrators hide or remove reported reviews through recorded decisions; ratings feed search.
- *Database:* review, review_response, moderation_decision.
- *API:* Eligibility check on Completed bookings; rating aggregation into the search read model.
- *UI:* Review form, owner response, admin moderation queue.
- *Tests:* Ineligible guest rejected; second review rejected; moderation decision is audited.

**S3-07 Complaints, disputes, listing reports, oversight** (Pri M, track B, D3 to D6)

- *Done when:* Guests and owners submit complaints, disputes, support requests and reports; administrators record, investigate, respond and resolve with a full trail.
- *Database:* support_case, case_event, listing_report.
- *API:* Case workflow and status tracking; report listing; owner reports of misleading guest information (one capability serves UR-O16 and FR-80).
- *UI:* Report and dispute forms; admin case console.
- *Tests:* End-to-end resolution with audit trail; status visible to the submitter.

**S3-08 Detail with reviews, favourites, compare, recently viewed** (Pri C, track C, D1 to D3)

- *Done when:* Listing detail shows reviews; signed-in guests save favourites, compare properties side by side and see recently viewed.
- *Database:* favourite, recently_viewed.
- *API:* Favourites and recently-viewed endpoints.
- *UI:* Heart button, compare view, recently viewed strip.
- *Tests:* Favourites private to the user; compare handles two to four properties.

**S3-09 Dashboards, date-filtered reports and exports** (Pri S, track C, D5 to D8)

- *Done when:* Owners and administrators view dashboards within 3 seconds and export occupancy, reservation, income, expense, net-profit and payment-activity reports for any period to PDF, CSV and Excel.
- *Database:* Read models and views only; no business tables.
- *API:* Report endpoints and export generators; read-only over other modules.
- *UI:* Owner and admin dashboards; period selector; export buttons.
- *Tests:* Report totals match the ledger; dashboard timing; export formats open correctly.

**S3-10 Reminders, announcements and complete status coverage** (Pri S, track B, D5 to D6)

- *Done when:* Booking and stay reminders and platform announcements are sent; users are notified when booking, payment, verification, complaint, dispute or review status changes.
- *API:* Reminder schedules; announcements; subscribers for support and review events.
- *Tests:* One notification per status change; reminders sent once.

**S3-11 Audit coverage for booking, financial and admin actions** (Pri M, track B, D6 to D8)

- *Done when:* Significant administrative, verification, booking-status and financial actions are all recorded (action, user, date/time) and traceable.
- *API:* Hooks wired for refunds, payouts, expenses and cancellations (earlier sprints hooked their own actions).
- *Tests:* Audit-coverage test enumerates every state-changing endpoint and asserts an audit entry.

**S3-12 Optional two-factor authentication** (Pri C, track C, D6 to D7)

- *Done when:* Users can switch on two-factor sign-in.
- *Database:* no credential table; optional FindStay UI preference only if needed.
- *API:* Supabase Auth MFA enrolment and challenge flow; Spring continues to validate the resulting JWT.
- *UI:* Security settings page.
- *Tests:* Enrol, sign in, lose factor recovery path.

**S3-13 Performance, load, uptime, recovery and PCI scope** (Pri M, track C, D6 to D9)

- *Done when:* Load test reaches the agreed concurrency; uptime monitoring and failure recovery are demonstrated; PCI scope is confirmed as hosted checkout with no card storage.
- *Tests:* Load test at the P-05 target (S1 states 1,000 concurrent users); kill and restart drills; restore drill; PCI scope note signed off.

**S3-14 UAT, security testing and Phase 1 exit** (Pri M, track A, D8 to D10)

- *Done when:* Owner and administrator modules pass UAT; security tests pass; financial calculations, review eligibility, verification and mobile responsiveness are tested; the platform supports real users; the exit checklist is passed.
- *Tests:* UAT scripts per role; security test report; exit checklist (Section 4.5 of the phased plan) signed by the Product Owner; backup before release; R3 tagged.

### 8.4 Demo script for Sprint Review

1. A guest cancels a confirmed booking under the recorded policy; an administrator approves the refund; the ledger shows the reversal and the guest is notified.
2. An owner sees payout status for a completed stay; an administrator reconciles payments.
3. An owner records an expense and sees income, expenses and net profit per property; exports a report to PDF, CSV and Excel.
4. A guest and an owner chat in the app; a guest saves a favourite and compares two properties.
5. After check-out the guest posts one review; the owner responds; an administrator hides a reported review with a recorded decision.
6. A guest reports a listing and files a dispute; an administrator resolves it end to end with a full audit trail.
7. The load test, restore drill and optional two-factor sign-in pass; the Phase 1 exit checklist is signed off.

### 8.5 Hand-off: what this sprint builds in so the next sprint needs no edits

- Seam tests are green before Sprint 4: availability accepts a reason other than booking; a charge can be created without a booking; a role can be added by migration; audit accepts any entity type; documents accept any owner type.
- `income_record.source_type` and expense categories are generic, so rent income and maintenance costs plug in during Sprint 4 without schema change.
- Reporting uses a registry of read models and views, so Phase 2 adds reports without editing existing ones.
- The portal router supports adding portals (tenant, maintenance, accountant) by registration.
- Notification templates and event types are open for rent-due, lease-expiry and maintenance events.
- The Phase 1 module-boundary check passes with zero Phase 2 references.

### 8.6 Sprint risks

- Widest sprint by module count. Must stories first (cancellation, refunds, payouts, finance, reviews, support, hardening, UAT); Could stories (favourites, 2FA) go last.
- J-03 and P-06 are business decisions; if either is late, Sprint 3 payouts and refunds cannot be accepted.
- Sprint 4 starts straight after R3; reserve capacity for R3 fixes.

---

## 9. Sprint 4: Long-Term Rentals and Maintenance

| | |
|---|---|
| **Weeks** | Weeks 7-8 (example Mon 28 Dec 2026 to Fri 08 Jan 2027) |
| **Phase and release** | Phase 2, release R4: Phase 2 release 1 (production) |
| **Modules** | tenancy, rent, maintenance (Phase 2); extensions through seams to catalog, availability, payments, notification, media, finance, organization |
| **Requirement items accepted** | 18 |
| **Decisions needed** | Before D1: Phase 1 exit checklist passed; Phase 2 ERD reviewed against the seams. By D8: hostel requirement set (Section 5.5 of the phased plan), J-04, J-05, P-11 decided for Sprint 5. |

**Sprint Goal.** A manager runs long-term rentals end to end: applicants apply, tenants sign leases and pay deposits and rent, arrears and late fees are tracked, and maintenance requests flow from tenants to staff and vendors, all without editing Phase 1 code.

**Parallel tracks** (for more than one developer; one developer works them in day order)

- Track A: Tenancy and rent
- Track B: Maintenance and status blocks

### 9.1 Sprint backlog

| Story | Epic | Title | Pri | Track | Days | Requirement IDs |
|-------|------|-------|:---:|:-----:|:----:|-----------------|
| S4-01 | Phase 2 foundation | Seam check, V2 migrations, role seed and portal shells | M | A | D1-D2 | Extends FR-01, FR-07, TA-03 (see Section 11.3) |
| S4-02 | Tenancy | Browse vacant units and rental applications | M | A | D2-D5 | UR-AP01, UR-AP02, UR-AP03, UR-AP04, FR-103 |
| S4-03 | Tenancy | Tenants and lease agreements | M | A | D3-D6 | UR-PM01, FR-101 |
| S4-04 | Tenancy | Lease renewals and terminations | S | A | D5-D7 | FR-102 |
| S4-05 | Tenancy | Digital signing and security deposits | M | A | D5-D8 | FR-104 |
| S4-06 | Rent | Recurring rent invoicing, tracking and arrears | M | A | D4-D7 | FR-105 |
| S4-07 | Rent | Late fees, notices and reminders | S | A | D7-D9 | FR-106 |
| S4-08 | Maintenance | Maintenance requests and tickets | M | B | D2-D5 | FR-97, FR-98 |
| S4-09 | Maintenance | Maintenance staff jobs, photos and invoices | M | B | D4-D7 | UR-M01, UR-M02, UR-M03, FR-99 |
| S4-10 | Maintenance | Cost tracking and vendors | S | B | D6-D8 | FR-100 |
| S4-11 | Maintenance | Occupancy and maintenance status through availability blocks | M | B | D7-D8 | Extends FR-19 (see Section 11.3) |
| S4-12 | Planning | Hostel scope workshop and Sprint 5 preparation | M | A | D6-D8 | Prepares BR-03 hostel part (Sprint 5) |
| S4-13 | Release | Stabilise, regression and release R4 | M | A | D9-D10 | (release and quality work; no new IDs) |

### 9.2 Day-by-day plan

| Story | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | D10 |
|-------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| S4-01 Seam check, V2 migrations, role seed and portal shells | ■ | ■ |  |  |  |  |  |  |  |  |
| S4-02 Browse vacant units and rental applications |  | ■ | ■ | ■ | ■ |  |  |  |  |  |
| S4-08 Maintenance requests and tickets |  | ■ | ■ | ■ | ■ |  |  |  |  |  |
| S4-03 Tenants and lease agreements |  |  | ■ | ■ | ■ | ■ |  |  |  |  |
| S4-06 Recurring rent invoicing, tracking and arrears |  |  |  | ■ | ■ | ■ | ■ |  |  |  |
| S4-09 Maintenance staff jobs, photos and invoices |  |  |  | ■ | ■ | ■ | ■ |  |  |  |
| S4-04 Lease renewals and terminations |  |  |  |  | ■ | ■ | ■ |  |  |  |
| S4-05 Digital signing and security deposits |  |  |  |  | ■ | ■ | ■ | ■ |  |  |
| S4-10 Cost tracking and vendors |  |  |  |  |  | ■ | ■ | ■ |  |  |
| S4-12 Hostel scope workshop and Sprint 5 preparation |  |  |  |  |  | ■ | ■ | ■ |  |  |
| S4-07 Late fees, notices and reminders |  |  |  |  |  |  | ■ | ■ | ■ |  |
| S4-11 Occupancy and maintenance status through availability blocks |  |  |  |  |  |  | ■ | ■ |  |  |
| S4-13 Stabilise, regression and release R4 |  |  |  |  |  |  |  |  | ■ | ■ |
| Sprint Planning | ■ | | | | | | | | | |
| Daily Scrum | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ |
| Feature freeze | | | | | | | | ■ | | |
| Staging regression and release | | | | | | | | | ■ | |
| Review, retrospective, pre-planning | | | | | | | | | | ■ |

### 9.3 Story detail and tasks

**S4-01 Seam check, V2 migrations, role seed and portal shells** (Pri M, track A, D1 to D2)

- *Done when:* Seam tests pass on the new branch; Tenant, Applicant and Maintenance Staff roles and permissions are seeded by migration; tenant and maintenance portals are registered. Extends FR-01, FR-07 and TA-03.
- *Database:* Phase 2 migrations in the V2_01 to V2_29 range; role and permission seeds; LEASE and MAINTENANCE availability reasons; MONTHLY billing-period row.
- *API:* Role-seed migration; permission codes `tenancy.*`, `rent.*`, `maintenance.*`.
- *UI:* Tenant portal and maintenance portal registered in the portal router.
- *Tests:* Phase 1 test suite unchanged and green; module-boundary check shows no Phase 1 module depends on Phase 2.

**S4-02 Browse vacant units and rental applications** (Pri M, track A, D2 to D5)

- *Done when:* Applicants browse vacant units, submit applications with documents and track status; managers screen applicants.
- *Database:* applicant, application, application_document (generic documents).
- *API:* Vacant units query via catalog and availability read APIs; application workflow; screening notes and decision.
- *UI:* Applicant portal pages; manager screening queue.
- *Tests:* Only vacant units listed; documents private to applicant and authorised staff.

**S4-03 Tenants and lease agreements** (Pri M, track A, D3 to D6)

- *Done when:* Managers create tenants and lease agreements against units and manage rental records.
- *Database:* tenant, lease, lease_document.
- *API:* Lease create and edit; availability LEASE block written through the public API.
- *UI:* Tenant and lease screens.
- *Tests:* A leased unit cannot be booked for overlapping short stays; a lease cannot overlap another lease.

**S4-04 Lease renewals and terminations** (Pri S, track A, D5 to D7)

- *Done when:* Managers renew and terminate leases; blocks update accordingly.
- *API:* Renew (new term) and terminate (early end) workflows.
- *UI:* Renewal and termination dialogs.
- *Tests:* Termination releases the unit from the termination date; renewal extends the block without gaps.

**S4-05 Digital signing and security deposits** (Pri M, track A, D5 to D8)

- *Done when:* Leases are signed digitally by both parties with an audited record; the security deposit is charged and tracked.
- *Database:* security_deposit; signature record on lease_document.
- *API:* Sign endpoints; deposit charge through payments; deposit return and deduction records.
- *UI:* Signing page; deposit status.
- *Tests:* Signature record immutable and audited; deposit paid through the existing Paystack flow.

**S4-06 Recurring rent invoicing, tracking and arrears** (Pri M, track A, D4 to D7)

- *Done when:* Rent schedules generate invoices each period, payments are tracked, and arrears are identified.
- *Database:* rent_schedule, rent_invoice, arrears_case.
- *API:* Scheduled invoice generation (idempotent); rent charges through payments; MONTHLY billing-period row used.
- *UI:* Rent roll and arrears views.
- *Tests:* Invoice job run twice creates one invoice per period; payment settles the invoice and ledger balances.

**S4-07 Late fees, notices and reminders** (Pri S, track A, D7 to D9)

- *Done when:* Late fees are applied by rule; notices and reminders (rent due, lease expiry) are sent. Extends FR-72.
- *Database:* late_fee, notice.
- *API:* Late-fee rule engine; notice generation; rent-due and lease-expiry events registered in the notification registry.
- *Tests:* Late fee applied once per rule; reminder sent once.

**S4-08 Maintenance requests and tickets** (Pri M, track B, D2 to D5)

- *Done when:* Requests are received, recorded and assigned; tickets have priority and scheduling.
- *Database:* maintenance_ticket.
- *API:* Request intake from tenants and managers; ticket priority, schedule and assignment.
- *UI:* Tenant request form; manager ticket board.
- *Tests:* Tenant sees only their own requests; priority ordering.

**S4-09 Maintenance staff jobs, photos and invoices** (Pri M, track B, D4 to D7)

- *Done when:* Maintenance staff receive assigned jobs, update status, upload photographs and submit invoices.
- *Database:* maintenance_invoice; photos as media assets.
- *API:* Assigned jobs; status updates; invoice submission.
- *UI:* Maintenance staff portal.
- *Tests:* Staff see only assigned jobs; invoice linked to ticket.

**S4-10 Cost tracking and vendors** (Pri S, track B, D6 to D8)

- *Done when:* Maintenance costs are tracked per property and vendors are managed.
- *Database:* vendor; cost recorded as finance expenses in a maintenance category.
- *API:* Vendor CRUD; cost posting through the finance API.
- *UI:* Vendor list and cost summary.
- *Tests:* Costs appear in owner expense totals without changes to finance.

**S4-11 Occupancy and maintenance status through availability blocks** (Pri M, track B, D7 to D8)

- *Done when:* Unit status shows leased and under-maintenance through the same block API. Extends FR-19.
- *API:* LEASE and MAINTENANCE blocks written and released; derived unit status includes the new reasons.
- *Tests:* Status changes appear in search availability and owner calendar with no Phase 1 code edit.

**S4-12 Hostel scope workshop and Sprint 5 preparation** (Pri M, track A, D6 to D8)

- *Done when:* Hostel requirement set approved: unit of sale, billing period, agreement type, discovery filters.
- *Tests:* Written decision log; Sprint 5 backlog refined.

**S4-13 Stabilise, regression and release R4** (Pri M, track A, D9 to D10)

- *Done when:* R4 is tagged and deployed; Sprint 1 to 3 regression is green; Sprint Review accepted.
- *Tests:* Full regression on a copy of production data; backup before release; smoke test.

### 9.4 Demo script for Sprint Review

1. An applicant browses vacant units, applies, uploads documents and tracks the application.
2. A manager screens the applicant, creates the tenant and a lease on a unit; the unit shows leased through an availability block; short-stay search no longer offers those dates.
3. The tenant and manager sign digitally; the security deposit is charged and paid through the existing payments flow.
4. Monthly rent invoices are generated; a late payment creates arrears, a late fee and a reminder.
5. The manager renews one lease and terminates another.
6. A tenant raises a maintenance request; the manager creates a ticket, sets priority, schedules and assigns it; maintenance staff update the status, upload photos and submit an invoice; costs and vendor are tracked.
7. Phase 1 regression, including every seam test, is green.

### 9.5 Hand-off: what this sprint builds in so the next sprint needs no edits

- `lease_type` is a lookup (STANDARD now); Sprint 5 adds HOSTEL_TERM without changing tenancy.
- Lease occupancy and maintenance writes availability blocks through the existing public API with new reasons (LEASE, MAINTENANCE) added by data migration.
- Rent and deposits are ordinary charges settled through the existing payments flow and ledger; no payments code changes.
- Accountant role is not seeded here; Sprint 5 seeds it by migration. Maintenance costs are exposed through finance expense categories so Sprint 5 accounting reads them with no change.
- Tenancy exposes read APIs (lease, tenant, term dates, unit) that the hostel module uses in Sprint 5.

### 9.6 Sprint risks

- Reserve at least 15% capacity for R3 fixes because Sprint 4 starts immediately after Phase 1 go-live.
- Digital signing approach (built-in signature capture versus external provider) must be chosen on D1; default is built-in capture with an audited signature record.
- Do not edit Phase 1 modules. If a story seems to need a Phase 1 change, raise it at the daily scrum as a seam gap.

---

## 10. Sprint 5: Accountants, Student Hostels and Final Release

| | |
|---|---|
| **Weeks** | Weeks 9-10 (example Mon 11 Jan 2027 to Fri 22 Jan 2027) |
| **Phase and release** | Phase 2, release R5: Phase 2 final release (production) |
| **Modules** | accounting, hostel, assistant (Phase 2); extensions to finance, payments, support, search, tenancy, notification through seams |
| **Requirement items accepted** | 9 |
| **Decisions needed** | Before D1: hostel requirement set approved; J-04 (AI-assisted support), J-05 (text-to-speech) and P-11 (calendar boundary) decided; external accounting tool named for NFR-61. |

**Sprint Goal.** Accountants reconcile and report, student hostels can be listed and let on term-based agreements, and the optional items (AI-assisted support, text-to-speech, calendar integration, remaining monetisation) are delivered, ending with a full regression and Phase 2 sign-off.

**Parallel tracks** (for more than one developer; one developer works them in day order)

- Track A: Accounting and monetisation
- Track B: Student hostels
- Track C: Optional items

### 10.1 Sprint backlog

| Story | Epic | Title | Pri | Track | Days | Requirement IDs |
|-------|------|-------|:---:|:-----:|:----:|-----------------|
| S5-01 | Accounting | Accountant role, reconciliation, expenses and statements | M | A | D1-D5 | UR-AC01, UR-AC02, UR-AC03, UR-AC04 |
| S5-02 | Accounting | External accounting integration | S | A | D4-D7 | NFR-61 |
| S5-03 | Student hostels | Hostel inventory, term rates, agreements and discovery | M | B | D1-D7 | Delivers the Phase 2 part of BR-03 (see Section 11.3) |
| S5-04 | Assistant | AI-assisted support and escalation | C | C | D4-D7 | FR-95, FR-96 |
| S5-05 | Accessibility | Text-to-speech | C | C | D6-D7 | NFR-06 |
| S5-06 | Integration | Calendar integration | C | C | D6-D8 | NFR-62 |
| S5-07 | Monetisation | Phase 2 revenue features | S | A | D5-D8 | Delivers the Phase 2 part of BR-12 (see Section 11.3) |
| S5-08 | Release | Full regression, Phase 2 UAT and final release R5 | M | A | D8-D10 | (release and quality work; no new IDs) |

### 10.2 Day-by-day plan

| Story | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | D10 |
|-------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| S5-01 Accountant role, reconciliation, expenses and statements | ■ | ■ | ■ | ■ | ■ |  |  |  |  |  |
| S5-03 Hostel inventory, term rates, agreements and discovery | ■ | ■ | ■ | ■ | ■ | ■ | ■ |  |  |  |
| S5-02 External accounting integration |  |  |  | ■ | ■ | ■ | ■ |  |  |  |
| S5-04 AI-assisted support and escalation |  |  |  | ■ | ■ | ■ | ■ |  |  |  |
| S5-07 Phase 2 revenue features |  |  |  |  | ■ | ■ | ■ | ■ |  |  |
| S5-05 Text-to-speech |  |  |  |  |  | ■ | ■ |  |  |  |
| S5-06 Calendar integration |  |  |  |  |  | ■ | ■ | ■ |  |  |
| S5-08 Full regression, Phase 2 UAT and final release R5 |  |  |  |  |  |  |  | ■ | ■ | ■ |
| Sprint Planning | ■ | | | | | | | | | |
| Daily Scrum | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ |
| Feature freeze | | | | | | | | ■ | | |
| Staging regression and release | | | | | | | | | ■ | |
| Review, retrospective, pre-planning | | | | | | | | | | ■ |

### 10.3 Story detail and tasks

**S5-01 Accountant role, reconciliation, expenses and statements** (Pri M, track A, D1 to D5)

- *Done when:* Accountants access relevant financial records, reconcile payments, manage expenses and generate financial statements. Extends FR-01, FR-07, FR-59, BRL-17 and TA-03.
- *Database:* statement, reconciliation_run; Accountant role and permissions by migration (V2_30 onward).
- *API:* Accountant reconciliation workflow on top of the Phase 1 reconciliation; statement generation from ledger, income and expenses; expense permission extended to accountants.
- *UI:* Accountant portal registered in the portal router.
- *Tests:* Accountant sees only authorised organisations' records; statements tie to the ledger.

**S5-02 External accounting integration** (Pri S, track A, D4 to D7)

- *Done when:* Financial data can be exported or pushed to the chosen external accounting tool.
- *API:* Integration adapter behind an interface; mapping of accounts and categories.
- *Tests:* Round-trip sample data; failure is retried and logged.

**S5-03 Hostel inventory, term rates, agreements and discovery** (Pri M, track B, D1 to D7)

- *Done when:* Managers list hostels with bed or room inventory and term rates; students find and take hostel places on lease-style agreements. Delivers the hostel part of BR-03 (stories derived from Section 5.5; not source IDs).
- *Database:* bed, academic_term, hostel_rate_plan; billing-period rows TERM and ACADEMIC_YEAR; `lease_type` HOSTEL_TERM.
- *API:* Hostel module on top of catalog units; agreements through the tenancy API; campus-proximity and room-sharing filters registered with the search filter provider.
- *UI:* Hostel listing editor; student hostel search and agreement pages.
- *Tests:* Beds cannot be double-assigned for a term; term blocks written through the availability API; search shows hostels without changes to existing providers.

**S5-04 AI-assisted support and escalation** (Pri C, track C, D4 to D7)

- *Done when:* Common queries get a first response from the assistant; unresolved queries escalate to administrators.
- *Database:* assistant_session, escalation.
- *API:* Assistant endpoint with a prepared knowledge base; escalation creates a support case through the support API.
- *UI:* Help widget; admin view of escalations.
- *Tests:* Escalation produces exactly one support case; assistant never exposes another user's data.

**S5-05 Text-to-speech** (Pri C, track C, D6 to D7)

- *Done when:* Listings and key pages can be read aloud.
- *UI:* Read-aloud control using the browser speech service.
- *Tests:* Works on supported browsers; control hidden where unsupported.

**S5-06 Calendar integration** (Pri C, track C, D6 to D8)

- *Done when:* Owners can synchronise availability with an external calendar where required.
- *API:* Calendar feed export and import mapped to availability blocks through the public API.
- *Tests:* Imported blocks cannot create overlaps; export reflects bookings and blocks.

**S5-07 Phase 2 revenue features** (Pri S, track A, D5 to D8)

- *Done when:* Sponsored listings, premium subscription tier and optional verification and photography packages are available as charges. Extends BR-12.
- *Database:* subscription, sponsored_listing, service_package.
- *API:* New charge types settled through the existing payments flow and ledger; search ranking provider for sponsored listings.
- *Tests:* Fee and package charges settle and reconcile; sponsored placement labelled.

**S5-08 Full regression, Phase 2 UAT and final release R5** (Pri M, track A, D8 to D10)

- *Done when:* R5 is tagged and deployed; Sprint 1 to 4 regression is green; Phase 2 UAT signed; handover documentation complete.
- *Tests:* Full regression on a copy of production data; security re-test; backup before release; handover pack (ERD, OpenAPI, runbooks).

### 10.4 Demo script for Sprint Review

1. An accountant signs in to the accountant portal, reconciles payment records, records an expense and generates a financial statement.
2. Data flows to the chosen external accounting tool.
3. A manager lists a student hostel with beds or rooms and term or academic-year rates; a student finds it by campus proximity and room-sharing filters and signs a hostel agreement.
4. A user asks the assistant a common question and gets an answer; an unresolved question is escalated to an administrator as a support case.
5. Text-to-speech reads a listing page aloud.
6. An owner connects a calendar and sees availability synchronised.
7. Full regression of Sprints 1 to 4 passes; Phase 2 is signed off.

### 10.5 Hand-off: what this sprint builds in so post-plan work needs no edits

- Nothing in this sprint edits earlier modules. Hostel uses tenancy through `lease_type = HOSTEL_TERM`, its own `bed` table referencing `unit`, the term and academic-year billing-period rows, and a search filter provider.
- Accountants read finance and payments through read APIs and the Accountant membership.
- The assistant escalates into the existing `support_case` API.
- Post-sprint backlog items (USSD, mobile apps, push notifications, interactive maps) need only new channels in front of the existing REST API.

### 10.6 Sprint risks

- Hostel scope is not in the source register. If the requirement set is not approved by Sprint 4 D8, S5-03 shrinks to a design spike and the hostel part of BR-03 moves to the post-plan backlog through change control.
- Optional items (S5-04, S5-05, S5-06) depend on J-04, J-05 and P-11. Could stories go last.
- Last sprint: no slack for spill beyond week 10; anything unfinished must go through change control.

---

## 11. Traceability, Counts and Carried-Over Items

### 11.1 Items per sprint by category

| Category | S1 | S2 | S3 | S4 | S5 | Total |
|----------|---:|---:|---:|---:|---:|------:|
| User requirements | 17 | 19 | 26 | 8 | 4 | 74 |
| System functional | 28 | 36 | 30 | 10 | 2 | 106 |
| System non-functional | 38 | 15 | 10 | 0 | 3 | 66 |
| Business requirements | 4 | 6 | 2 | 0 | 0 | 12 |
| Business rules | 6 | 7 | 7 | 0 | 0 | 20 |
| Technical / architecture | 8 | 5 | 0 | 0 | 0 | 13 |
| Project / deployment | 7 | 2 | 4 | 0 | 0 | 13 |
| **Total** | **108** | **90** | **79** | **18** | **9** | **304** |

Matches the phased plan: 186 P1 + 91 P1+P2 + 27 P2 = 304 requirement IDs. Add the 5 backlog items from the source register to reach the 309 items counted there (the source's own Section K total of 291 is corrected in the phased plan, Section 11.2).

**Features versus cross-cutting items per sprint**

| | S1 | S2 | S3 | S4 | S5 |
|---|---:|---:|---:|---:|---:|
| Module features | 54 | 64 | 64 | 18 | 6 |
| Cross-cutting items (`platform` module) | 54 | 26 | 15 | 0 | 3 |

### 11.2 Phase and sprint

| Phase code (phased plan) | S1 | S2 | S3 | S4 | S5 | Total |
|--------------------------|---:|---:|---:|---:|---:|------:|
| P1 | 52 | 71 | 63 | 0 | 0 | 186 |
| P1+P2 | 56 | 19 | 16 | 0 | 0 | 91 |
| P2 | 0 | 0 | 0 | 18 | 9 | 27 |

### 11.3 Phase 2 follow-on work for P1+P2 items

These nine items are delivered in a Phase 1 sprint (their ledger row shows it) and have specific follow-on work in Phase 2. No Phase 1 code is edited.

| ID | Phase 1 sprint | Phase 2 follow-on story | What happens |
|----|:--------------:|-------------------------|--------------|
| FR-01 | S1 (S1-04) | S4-01 (Tenant, Applicant, Maintenance Staff) and S5-01 (Accountant) | Role-seed migrations; no change to Phase 1 code. |
| FR-07 | S1 (S1-06) | S4-01 and S5-01 | New permission codes and role-permission rows by migration. |
| FR-19 | S2 (S2-08) | S4-11 | Lease occupancy and the maintenance workflow write blocks through the availability API; status derivation includes the new reasons. |
| FR-59 | S3 (S3-03) | S5-01 | Accountant reconciliation workflow (UR-AC01) built on the Phase 1 reconciliation. |
| FR-72 | S3 (S3-10) | S4-07 | Rent-due and lease-expiry reminders registered as new event types. |
| BR-03 | S1 (S1-13) | S5-03 | Student hostels (the Phase 2 part of BR-03); Phase 1 already supports hotels, budget hotels, guesthouses and serviced apartments. |
| BR-12 | S2 (S2-10) | S5-07 | Sponsored listings, premium subscription tier and verification/photography packages; Phase 1 carries commission and convenience fee. |
| BRL-17 | S3 (S3-04) | S5-01 | Accountants may add or amend expense records. |
| TA-03 | S2 (S2-04) | S4-01 (tenant and maintenance portals) and S5-01 (accountant portal) | New portals registered in the portal router. |

The other 82 P1+P2 items bind Phase 2 unchanged. They are accepted in their Phase 1 sprint and re-verified by the regression chain in Sprints 4 and 5: NFR-01, NFR-02, NFR-03, NFR-04, NFR-07, NFR-08, NFR-09, NFR-10, NFR-11, NFR-12, NFR-13, NFR-16, NFR-19, NFR-20, NFR-21, NFR-22, NFR-23, NFR-24, NFR-25, NFR-26, NFR-27, NFR-28, NFR-31, NFR-32, NFR-33, NFR-35, NFR-36, NFR-37, NFR-40, NFR-41, NFR-42, NFR-43, NFR-44, NFR-45, NFR-46, NFR-47, NFR-48, NFR-49, NFR-50, NFR-51, NFR-52, NFR-53, NFR-54, NFR-55, NFR-56, NFR-57, NFR-58, NFR-63, NFR-64, NFR-65, NFR-66, BR-07, BR-09, BR-10, BR-11, BRL-01, BRL-05, BRL-15, BRL-18, BRL-20, TA-01, TA-02, TA-05, TA-06, TA-07, TA-08, TA-09, TA-10, TA-11, TA-12, TA-13, PD-01, PD-02, PD-05, PD-06, PD-07, PD-08, PD-09, PD-10, PD-11, PD-12, PD-13.

### 11.4 Mapping to the phased plan's milestones

| Phased plan milestone | Sprint | Notes |
|-----------------------|:------:|-------|
| M1 Foundation and skeleton | S1 | Cross-cutting items established here are listed in the ledger. |
| M2 Listings and verification | S1 | Availability calendar moved here from M4 (UR-O02, UR-O03, FR-18, FR-39); basic admin moved here from M7. |
| M3 Discovery | S2 and S3 | Search, filters, detail and map in S2; reviews on detail, favourites, compare and recently viewed in S3. |
| M4 Availability and booking | S2 and S3 | Holds, booking, check-in/out and vouchers in S2; cancellation and modification in S3 (they need refunds and the cancellation policy). |
| M5 Payments | S2 and S3 | Checkout, charges, ledger, webhooks in S2; refunds, payouts, reconciliation in S3. |
| M6 Owner operations | S3 | Finance and messaging. |
| M7 Trust and governance | S1 and S3 | Admin basics in S1; reviews, support, reporting, moderation in S3. |
| M8 Hardening and release | S1 to S3 | Cross-cutting items are accepted in the first sprint that can verify them; formal hardening and exit in S3. |
| P2-M1 Tenancy core | S4 |  |
| P2-M2 Rent and deposits | S4 |  |
| P2-M3 Maintenance | S4 |  |
| P2-M4 Accounting | S5 |  |
| P2-M5 Student hostels | S5 | Needs the approved hostel requirement set. |
| P2-M6 Optional items | S5 | Subject to J-04, J-05, P-11. |

### 11.5 Backlog after the ten weeks (source Section I)

| # | Enhancement | Relationship to the sprints |
|:-:|-------------|-----------------------------|
| 1 | Offline USSD booking for users without smartphones or internet. | Needs a new channel in front of the existing API. |
| 2 | Dedicated Android and iOS mobile applications. | The REST API (TA-02) is already the integration point. |
| 3 | Push notifications through mobile applications. | Depends on item 2. Sprint 1 to 3 notifications cover in-app, email and SMS. |
| 4 | Interactive campus and city maps showing nearby landmarks. | Overlaps FR-34, which delivers map location and distance in Sprint 2. |
| 5 | Automatic calendar synchronisation with external booking platforms. | Overlaps NFR-62 (Sprint 5, S5-06): see P-11. |

### 11.6 Stakeholders by first sprint served

| Stakeholder | First sprint | Later |
|-------------|:------------:|-------|
| Accommodation seekers (students, workers, families, tourists) | S2 | Students seeking hostels: S5 |
| Property owners / landlords | S1 | Long-term landlords: S4 |
| Property managers / agents | S1 | Extended long-term role: S4 |
| Property staff | S1 | Booking operations: S2 |
| Platform administrators | S1 | Moderation, disputes: S3 |
| Tenants / prospective tenants | S4 |  |
| Accountants / financial personnel | S5 |  |
| Maintenance staff | S4 |  |
| Payment-service providers (Mobile Money, banks, card gateways) | S2 | Refunds and payouts: S3 |
| Universities / institutions | S2 | Campus-proximity search; hostels: S5 |
| Tourism and regulatory bodies | S1 | Verification documents |
| Ghana Data Protection Authority | S1 | Consent and data-protection controls |
| Map / SMS / email service providers | S1 | Email and SMS: S1; map and distance: S2 |
| Cloud and hosting providers (Cloudflare, Render, Supabase) | S1 |  |
| Investors / project sponsors | S1 | Every Sprint Review; first revenue flow: S2 |
| Development, maintenance and support team | S1 |  |
| Project owner / supervisor | S1 | Product Owner; accepts every increment |

### 11.7 Technology stack by sprint

| Component | Technology | Introduced |
|-----------|-----------|:----------:|
| Backend language | Java JDK 21 | S1 |
| Backend framework | Spring Boot 3 | S1 |
| Frontend | React + TypeScript | S1 |
| Frontend build tool | Vite | S1 |
| UI | Tailwind CSS + shadcn/ui (Radix components) | S1 |
| Client data | TanStack Query | S1 |
| Forms and validation | React Hook Form + Zod | S1 |
| Database | Supabase PostgreSQL | S1 |
| ORM and pool | Spring Data JPA / Hibernate + HikariCP | S1 |
| Authentication | Supabase Auth | S1 |
| API security | Spring Security OAuth2 Resource Server validating Supabase JWTs via JWKS | S1 |
| File storage | Supabase Storage | S1 |
| Database migrations | Flyway (the only application-schema migration authority) | S1 |
| API documentation | springdoc OpenAPI / Swagger | S1 |
| Build tool | Apache Maven | S1 |
| Payment gateway | Paystack Ghana | S2 |
| Backend hosting | Render | S1 |
| Frontend hosting and security | Cloudflare Workers Static Assets, DNS, CDN, WAF and Turnstile | S1 |
| Monitoring | Spring Boot Actuator + Sentry | S1 |
| Testing | JUnit 5, Mockito, Testcontainers, Playwright | S1 |
| CI/CD | GitHub Actions | S1 |

Spring Modulith, Flyway and PostgreSQL `btree_gist` are introduced in Sprint 1 (S1-01).

### 11.8 Scope statements by release

| Source statement | Delivered by |
|------------------|--------------|
| Initial release: responsive web application focused on Ghana, with Takoradi as the pilot context. | R1 (owners), R2 (guest pilot), R3 (Phase 1 public launch). |
| Covers accommodation discovery, booking, payment, communication, stay management and post-stay feedback. | R2 and R3. |
| Also covers property-management and administrative capabilities. | Lightweight owner management and administration in R1 to R3; long-term tenancy, maintenance and accounting in R4 and R5. |

### 11.9 Change control

The phased plan's rules still apply: any new requirement needs an ID, a source, a phase and an owning module, and moving an item between sprints that crosses a phase boundary or beyond week 10 is recorded in the decision register.

---

## Appendix A. Allocation Ledger (every requirement ID)

Wording is copied from the phased plan, which copies the source register. Sprint is where the item is accepted; Story is its sprint story. Total rows: 304.

### A.1 User requirements (74)

| ID | Requirement | Module | Phase | Sprint | Story |
|----|-------------|--------|:-----:|:------:|-------|
| UR-A01 | Manage user accounts (create, suspend, restore). | `admin` | P1 | S1 | S1-16 |
| UR-A02 | Review, approve, reject, suspend, restore or request corrections to property listings. | `verification` | P1 | S1 | S1-15 |
| UR-A03 | Moderate platform content including reviews and reported listings. | `admin` | P1 | S3 | S3-06 |
| UR-A04 | Manage complaints, disputes and support requests. | `support` | P1 | S3 | S3-07 |
| UR-A05 | Manage transaction records and refund-related processes. | `payments` | P1 | S3 | S3-03 |
| UR-A06 | View platform-wide operational dashboards and reports. | `reporting` | P1 | S3 | S3-09 |
| UR-A07 | Inspect and maintain audit logs of significant actions. | `audit` | P1 | S1 | S1-08 |
| UR-A08 | Manage platform settings. | `admin` | P1 | S1 | S1-16 |
| UR-A09 | Respond to complaints and reported issues. | `support` | P1 | S3 | S3-07 |
| UR-AC01 | Reconcile payment records. | `accounting` | P2 | S5 | S5-01 |
| UR-AC02 | Record and manage expenses. | `accounting` | P2 | S5 | S5-01 |
| UR-AC03 | Generate financial statements. | `accounting` | P2 | S5 | S5-01 |
| UR-AC04 | Access relevant financial records. | `accounting` | P2 | S5 | S5-01 |
| UR-AN01 | Strong security and administrator-only access. | `platform` | P1 | S1 | S1-06 |
| UR-AN02 | Tamper-proof, auditable logs of significant actions. | `audit` | P1 | S1 | S1-08 |
| UR-AN03 | Error monitoring to detect failed payments or notifications. | `platform` | P1 | S2 | S2-13 |
| UR-AP01 | Browse vacant accommodation units. | `tenancy` | P2 | S4 | S4-02 |
| UR-AP02 | Submit rental applications. | `tenancy` | P2 | S4 | S4-02 |
| UR-AP03 | Upload supporting documents. | `tenancy` | P2 | S4 | S4-02 |
| UR-AP04 | Track application status. | `tenancy` | P2 | S4 | S4-02 |
| UR-G01 | Register, log in, log out and manage an account with email/phone, OTP verification and password recovery. | `identity` | P1 | S1 | S1-04 |
| UR-G02 | Search for accommodation by location, town, area, campus, keyword or distance to campus/workplace. | `search` | P1 | S2 | S2-01 |
| UR-G03 | Filter results by price range, accommodation type, amenities/facilities, availability, guest capacity and rating. | `search` | P1 | S2 | S2-02 |
| UR-G04 | View detailed listings: photos, description, price, house rules, amenities, location on map, availability, verification status and reviews. | `search` | P1 | S3 | S3-08 |
| UR-G05 | Save favourites and compare multiple properties side by side. | `search` | P1 | S3 | S3-08 |
| UR-G06 | View recently viewed properties. | `search` | P1 | S3 | S3-08 |
| UR-G07 | Submit a booking request for an available unit and date range; receive confirmation and booking status updates. | `booking` | P1 | S2 | S2-05 |
| UR-G08 | Pay deposits/rent securely (Mobile Money, card) and download receipts. | `payments` | P1 | S2 | S2-09 |
| UR-G09 | Modify or cancel bookings and request refunds according to applicable policy. | `booking` | P1 | S3 | S3-01 |
| UR-G10 | Access digital booking vouchers and check-in information. | `booking` | P1 | S2 | S2-12 |
| UR-G11 | Chat with or send enquiries to property owners/managers within the platform. | `messaging` | P1 | S3 | S3-05 |
| UR-G12 | Receive notifications for booking, payment, verification and other relevant events. | `notification` | P1 | S2 | S2-13 |
| UR-G13 | Submit ratings and reviews after completing an eligible stay. | `review` | P1 | S3 | S3-06 |
| UR-G14 | Report fake, misleading or unsafe listings. | `support` | P1 | S3 | S3-07 |
| UR-G15 | Submit complaints, disputes and support requests and track their status. | `support` | P1 | S3 | S3-07 |
| UR-G16 | Manage profile, booking history and notification preferences. | `identity` | P1 | S2 | S2-13 |
| UR-GN01 | Simple, intuitive interface navigable without training. | `platform` | P1 | S2 | S2-04 |
| UR-GN02 | Mobile-first; works on low-end phones and slow (3G/4G) networks. | `platform` | P1 | S2 | S2-04 |
| UR-GN03 | Verified listings and owners; personal and payment data kept private. | `platform` | P1 | S2 | S2-03 |
| UR-GN04 | Search results returned within a few seconds; pages load quickly. | `platform` | P1 | S2 | S2-04 |
| UR-GN05 | Platform accessible 24/7 with minimal downtime. | `platform` | P1 | S3 | S3-13 |
| UR-M01 | Receive assigned maintenance jobs. | `maintenance` | P2 | S4 | S4-09 |
| UR-M02 | Update maintenance job statuses. | `maintenance` | P2 | S4 | S4-09 |
| UR-M03 | Upload maintenance photographs and submit invoices. | `maintenance` | P2 | S4 | S4-09 |
| UR-O01 | Register, complete onboarding and submit identity and property documents for verification; track approval status. | `verification` | P1 | S1 | S1-12 |
| UR-O02 | Create, edit, deactivate and manage property listings including photos, descriptions, units, prices, amenities, house rules and availability. | `catalog` | P1 | S1 | S1-14 |
| UR-O03 | Manage property and unit availability calendars. | `availability` | P1 | S1 | S1-14 |
| UR-O04 | Receive, review, accept or decline booking requests. | `booking` | P1 | S2 | S2-06 |
| UR-O05 | Modify or cancel bookings according to applicable policy. | `booking` | P1 | S3 | S3-01 |
| UR-O06 | View booking dashboard: upcoming, active, completed and cancelled reservations. | `booking` | P1 | S2 | S2-06 |
| UR-O07 | Manage guest check-in and check-out. | `booking` | P1 | S2 | S2-12 |
| UR-O08 | Track payments and booking income. | `finance` | P1 | S3 | S3-04 |
| UR-O09 | Receive payouts for completed transactions. | `payments` | P1 | S3 | S3-02 |
| UR-O10 | Record and manage operational expenses and expense categories. | `finance` | P1 | S3 | S3-04 |
| UR-O11 | View income, expenses and net profit. | `finance` | P1 | S3 | S3-04 |
| UR-O12 | Generate date-filtered occupancy and financial reports. | `reporting` | P1 | S3 | S3-09 |
| UR-O13 | Communicate with guests via in-platform messaging. | `messaging` | P1 | S3 | S3-05 |
| UR-O14 | Respond to eligible guest reviews. | `review` | P1 | S3 | S3-06 |
| UR-O15 | Grant and manage access permissions for property staff. | `organization` | P1 | S1 | S1-07 |
| UR-O16 | Report inaccurate or misleading guest-submitted information for administrative review. | `support` | P1 | S3 | S3-07 |
| UR-ON01 | Simple, uncluttered interface suited to small providers. | `platform` | P1 | S1 | S1-03 |
| UR-ON02 | Access limited to own properties and financial records. | `platform` | P1 | S1 | S1-07 |
| UR-ON03 | Accurate, real-time availability and financial figures. | `platform` | P1 | S3 | S3-04 |
| UR-ON04 | Dashboards load within 3 seconds. | `platform` | P1 | S3 | S3-09 |
| UR-ON05 | Dependable service with backups so records are never lost. | `platform` | P1 | S1 | S1-02 |
| UR-PM01 | Manage tenants, leases and rental records. | `tenancy` | P2 | S4 | S4-03 |
| UR-PM02 | Manage reservations and availability for assigned properties. | `booking` | P1 | S2 | S2-06 |
| UR-PM03 | Assign access permissions to authorised staff. | `organization` | P1 | S1 | S1-07 |
| UR-PS01 | Access only properties and functions explicitly authorised by an owner/manager or administrator. | `organization` | P1 | S1 | S1-07 |
| UR-PS02 | View and update authorised booking information. | `booking` | P1 | S2 | S2-06 |
| UR-PS03 | Record guest check-in and check-out status. | `booking` | P1 | S2 | S2-12 |
| UR-PS04 | Support guests with enquiries within authorised scope. | `messaging` | P1 | S3 | S3-05 |
| UR-PSN01 | Restricted, role-limited access to protect sensitive data. | `organization` | P1 | S1 | S1-07 |
| UR-PSN02 | Quick, easy-to-use screens for front-desk tasks. | `platform` | P1 | S2 | S2-12 |

### A.2 System functional (106)

| ID | Requirement | Module | Phase | Sprint | Story |
|----|-------------|--------|:-----:|:------:|-------|
| FR-01 | Allow guests, owners/managers, property staff and administrators to create or receive accounts appropriate to their roles. | `identity` | P1+P2 | S1 | S1-04 |
| FR-02 | Authenticate users before granting access to protected functions. | `identity` | P1 | S1 | S1-04 |
| FR-03 | Support user login and logout. | `identity` | P1 | S1 | S1-04 |
| FR-04 | Provide password reset and account recovery through a verified contact channel. | `identity` | P1 | S1 | S1-05 |
| FR-05 | Support email or phone verification (OTP). | `identity` | P1 | S1 | S1-04 |
| FR-06 | Allow users to view and update authorised profile information. | `identity` | P1 | S1 | S1-05 |
| FR-07 | Enforce role-based access control (RBAC) and prevent access to unauthorised data or functions. | `identity` | P1+P2 | S1 | S1-06 |
| FR-08 | Allow owners/managers to submit identity and property-verification information for review. | `verification` | P1 | S1 | S1-12 |
| FR-09 | Support property-staff permissions explicitly granted by authorised owners/managers or administrators. | `organization` | P1 | S1 | S1-07 |
| FR-10 | Support optional two-factor authentication. | `identity` | P1 | S3 | S3-12 |
| FR-11 | Allow verified owners/managers to create property listings. | `catalog` | P1 | S1 | S1-13 |
| FR-12 | Allow owners/managers to update existing property listings. | `catalog` | P1 | S1 | S1-13 |
| FR-13 | Allow owners/managers to deactivate or pause property listings. | `catalog` | P1 | S1 | S1-13 |
| FR-14 | Allow owners/managers to upload property photographs and listing images. | `catalog` | P1 | S1 | S1-13 |
| FR-15 | Allow owners/managers to manage property descriptions, accommodation types, unit categories, capacity and quantities. | `catalog` | P1 | S1 | S1-13 |
| FR-16 | Allow owners/managers to manage property amenities, facilities and house rules. | `catalog` | P1 | S1 | S1-13 |
| FR-17 | Allow owners/managers to manage accommodation prices and rates. | `catalog` | P1 | S1 | S1-13 |
| FR-18 | Allow owners/managers to manage property and unit availability. | `availability` | P1 | S1 | S1-14 |
| FR-19 | Support property status management including vacant, occupied and under-maintenance. | `availability` | P1+P2 | S2 | S2-08 |
| FR-20 | Display property and owner verification status to guests. | `verification` | P1 | S2 | S2-03 |
| FR-21 | Publish a listing only after it meets verification and approval requirements set by administrators. | `verification` | P1 | S1 | S1-15 |
| FR-22 | Validate required information before a listing is saved or published. | `catalog` | P1 | S1 | S1-13 |
| FR-23 | Provide a searchable accommodation directory with keyword search and sorting. | `search` | P1 | S2 | S2-01 |
| FR-24 | Allow guests to search by geographical location, town, area, campus or neighbourhood. | `search` | P1 | S2 | S2-01 |
| FR-25 | Allow filtering by accommodation type. | `search` | P1 | S2 | S2-02 |
| FR-26 | Allow filtering by price range. | `search` | P1 | S2 | S2-02 |
| FR-27 | Allow filtering by amenities and facilities. | `search` | P1 | S2 | S2-02 |
| FR-28 | Allow filtering by guest capacity. | `search` | P1 | S2 | S2-02 |
| FR-29 | Allow filtering by intended stay dates / availability. | `search` | P1 | S2 | S2-02 |
| FR-30 | Allow filtering by ratings where available. | `search` | P1 | S2 | S2-02 |
| FR-31 | Display property photographs, descriptions, prices, unit options, facilities, house rules, availability and verification status. | `search` | P1 | S2 | S2-03 |
| FR-32 | Provide property favourites / saved listings for signed-in users. | `search` | P1 | S3 | S3-08 |
| FR-33 | Maintain a recently viewed property list. | `search` | P1 | S3 | S3-08 |
| FR-34 | Provide a map-based property location identifier with distance calculation. | `search` | P1 | S2 | S2-03 |
| FR-35 | Display appropriate messages when no search results are found. | `search` | P1 | S2 | S2-01 |
| FR-36 | Allow guests to submit booking requests for available accommodation units. | `booking` | P1 | S2 | S2-05 |
| FR-37 | Validate requested accommodation capacity and availability before accepting a booking request. | `booking` | P1 | S2 | S2-05 |
| FR-38 | Calculate the total booking amount based on selected accommodation and dates. | `booking` | P1 | S2 | S2-05 |
| FR-39 | Provide a real-time availability calendar. | `availability` | P1 | S1 | S1-14 |
| FR-40 | Prevent overlapping confirmed reservations for the same accommodation unit and dates. | `availability` | P1 | S2 | S2-08 |
| FR-41 | Temporarily hold accommodation availability during the booking process. | `availability` | P1 | S2 | S2-08 |
| FR-42 | Allow authorised owners/managers or staff to accept or decline booking requests. | `booking` | P1 | S2 | S2-06 |
| FR-43 | Support booking modification and cancellation by both guests and authorised property representatives. | `booking` | P1 | S3 | S3-01 |
| FR-44 | Maintain booking status history: Pending → Awaiting Payment → Confirmed → Cancelled / Completed / Declined. | `booking` | P1 | S2 | S2-07 |
| FR-45 | Automatically release held availability when a booking is declined, cancelled or expires. | `availability` | P1 | S2 | S2-08 |
| FR-46 | Automatically cancel unpaid booking requests when the configured payment window expires (30 minutes). | `booking` | P1 | S2 | S2-07 |
| FR-47 | Provide booking dashboards for guests and authorised property representatives. | `booking` | P1 | S2 | S2-06 |
| FR-48 | Support tracking of upcoming, active, completed and cancelled reservations. | `booking` | P1 | S2 | S2-06 |
| FR-49 | Support check-in and check-out status tracking. | `booking` | P1 | S2 | S2-12 |
| FR-50 | Generate digital booking confirmations and receipts/vouchers (including QR codes). | `booking` | P1 | S2 | S2-12 |
| FR-51 | Integrate with supported online payment gateways (Paystack Ghana). | `payments` | P1 | S2 | S2-09 |
| FR-52 | Support MTN Mobile Money, Telecel Cash and AT Money payment channels. | `payments` | P1 | S2 | S2-09 |
| FR-53 | Support bank-card payments. | `payments` | P1 | S2 | S2-09 |
| FR-54 | Record payment transactions and associate them with their corresponding bookings. | `payments` | P1 | S2 | S2-10 |
| FR-55 | Track payment statuses and verify payment results before confirming bookings. | `payments` | P1 | S2 | S2-10 |
| FR-56 | Process payment-provider callbacks and validate webhook signatures (HMAC-SHA512 for Paystack). | `payments` | P1 | S2 | S2-11 |
| FR-57 | Identify and reject duplicate payment notifications. | `payments` | P1 | S2 | S2-11 |
| FR-58 | Support refund requests and cancellation-related financial processes. | `payments` | P1 | S3 | S3-01 |
| FR-59 | Support payment reconciliation. | `payments` | P1+P2 | S3 | S3-03 |
| FR-60 | Automatically record booking income against the relevant property. | `finance` | P1 | S3 | S3-04 |
| FR-61 | Allow authorised users to record and manage property expenses and expense categories. | `finance` | P1 | S3 | S3-04 |
| FR-62 | Calculate property revenue, expenses and net profit. | `finance` | P1 | S3 | S3-04 |
| FR-63 | Support owner payouts for completed transactions. | `payments` | P1 | S3 | S3-02 |
| FR-64 | Support recording of financial transactions and their statuses. | `payments` | P1 | S2 | S2-10 |
| FR-65 | Provide in-app messaging between guests and authorised property representatives. | `messaging` | P1 | S3 | S3-05 |
| FR-66 | Provide automated notifications for booking-related events (confirmations, status changes, cancellations). | `notification` | P1 | S2 | S2-13 |
| FR-67 | Notify users about payment-status changes. | `notification` | P1 | S2 | S2-13 |
| FR-68 | Notify relevant users about verification-status changes. | `notification` | P1 | S1 | S1-10 |
| FR-69 | Provide email notifications. | `notification` | P1 | S1 | S1-10 |
| FR-70 | Support SMS notifications. | `notification` | P1 | S1 | S1-10 |
| FR-71 | Notify users about relevant account activities. | `notification` | P1 | S1 | S1-10 |
| FR-72 | Support announcements and reminders (e.g. rent-due, lease-expiry) where applicable. | `notification` | P1+P2 | S3 | S3-10 |
| FR-73 | Allow eligible guests (completed bookings only) to submit ratings and reviews; one review per completed booking. | `review` | P1 | S3 | S3-06 |
| FR-74 | Allow property owners to respond to guest reviews. | `review` | P1 | S3 | S3-06 |
| FR-75 | Allow administrators to moderate and remove reported reviews. | `review` | P1 | S3 | S3-06 |
| FR-76 | Allow guests to submit complaints and disputes and track their status. | `support` | P1 | S3 | S3-07 |
| FR-77 | Allow property representatives to submit support requests and disputes. | `support` | P1 | S3 | S3-07 |
| FR-78 | Allow administrators to record, investigate and respond to complaints and disputes. | `support` | P1 | S3 | S3-07 |
| FR-79 | Allow users to report listings that appear false, suspicious or inappropriate. | `support` | P1 | S3 | S3-07 |
| FR-80 | Allow owners to report inaccurate or misleading guest-submitted information for review. | `support` | P1 | S3 | S3-07 |
| FR-81 | Provide property-management dashboards. | `reporting` | P1 | S3 | S3-09 |
| FR-82 | Provide a platform-administration dashboard. | `reporting` | P1 | S3 | S3-09 |
| FR-83 | Generate occupancy, reservation, income, expense, net-profit and payment-activity reports. | `reporting` | P1 | S3 | S3-09 |
| FR-84 | Allow reports to be filtered by selected dates or reporting periods. | `reporting` | P1 | S3 | S3-09 |
| FR-85 | Support report exports in PDF, CSV and Excel formats. | `reporting` | P1 | S3 | S3-09 |
| FR-86 | Provide a dedicated administrative dashboard. | `admin` | P1 | S1 | S1-16 |
| FR-87 | Allow administrators to manage users and accounts. | `admin` | P1 | S1 | S1-16 |
| FR-88 | Allow administrators to manage property submissions: approve, reject, suspend, restore or request corrections. | `admin` | P1 | S1 | S1-15 |
| FR-89 | Allow administrators to manage transactions and refund-related processes. | `admin` | P1 | S3 | S3-03 |
| FR-90 | Allow administrators to moderate platform content. | `admin` | P1 | S3 | S3-06 |
| FR-91 | Allow administrators to manage complaints and disputes. | `admin` | P1 | S3 | S3-07 |
| FR-92 | Allow administrators to manage platform settings. | `admin` | P1 | S1 | S1-16 |
| FR-93 | Maintain audit logs for significant administrative, verification, booking-status and financial actions, identifying the action, user and date/time. | `audit` | P1 | S3 | S3-11 |
| FR-94 | Provide platform-wide operational reports. | `reporting` | P1 | S3 | S3-09 |
| FR-95 | Provide an AI-assisted support contact as a first-response layer for common user queries. | `assistant` | P2 | S5 | S5-04 |
| FR-96 | Allow unresolved AI-assisted queries to be escalated to human administrators. | `assistant` | P2 | S5 | S5-04 |
| FR-97 | Allow maintenance requests to be received, recorded and assigned. | `maintenance` | P2 | S4 | S4-08 |
| FR-98 | Support maintenance-ticket creation, priority management and scheduling. | `maintenance` | P2 | S4 | S4-08 |
| FR-99 | Allow maintenance staff to update job statuses, upload photographs and submit invoices. | `maintenance` | P2 | S4 | S4-09 |
| FR-100 | Support maintenance cost tracking and vendor management. | `maintenance` | P2 | S4 | S4-10 |
| FR-101 | Allow property managers to manage tenants and create/manage lease agreements. | `tenancy` | P2 | S4 | S4-03 |
| FR-102 | Support lease renewals and terminations. | `tenancy` | P2 | S4 | S4-04 |
| FR-103 | Support rental applications, applicant screening and document uploads. | `tenancy` | P2 | S4 | S4-02 |
| FR-104 | Support digital lease signing and security-deposit management. | `tenancy` | P2 | S4 | S4-05 |
| FR-105 | Support recurring rental invoicing, billing, rent tracking and arrears management. | `rent` | P2 | S4 | S4-06 |
| FR-106 | Support late-fee management and generation of rental notices and reminders. | `rent` | P2 | S4 | S4-07 |

### A.3 System non-functional (66)

| ID | Requirement | Module | Phase | Sprint | Story |
|----|-------------|--------|:-----:|:------:|-------|
| NFR-01 | Simple, intuitive, user-friendly interface requiring minimal training. | `platform` | P1+P2 | S1 | S1-03 |
| NFR-02 | Clear labels, consistent navigation and understandable instructions. | `platform` | P1+P2 | S1 | S1-03 |
| NFR-03 | Visible status messages and feedback for user actions. | `platform` | P1+P2 | S1 | S1-03 |
| NFR-04 | Accessible form controls. | `platform` | P1+P2 | S1 | S1-03 |
| NFR-05 | Icon-based navigation. | `platform` | P1 | S1 | S1-03 |
| NFR-06 | Text-to-speech functionality. | `platform` | P2 | S5 | S5-05 |
| NFR-07 | Interface accommodates users with low literacy or colour-vision difficulties. | `platform` | P1+P2 | S1 | S1-03 |
| NFR-08 | Financial information presented in an easy-to-understand format. | `platform` | P1+P2 | S3 | S3-04 |
| NFR-09 | Responsive interface for mobile phones, tablets and desktop devices. | `platform` | P1+P2 | S1 | S1-03 |
| NFR-10 | Supports modern web browsers (Chrome, Edge, Firefox, Safari). | `platform` | P1+P2 | S1 | S1-03 |
| NFR-11 | Content and financial information remain readable on smaller screens. | `platform` | P1+P2 | S3 | S3-04 |
| NFR-12 | No unnecessary horizontal scrolling on mobile devices. | `platform` | P1+P2 | S1 | S1-03 |
| NFR-13 | Public listing search results and standard dashboard views return within 3 seconds under normal use. | `platform` | P1+P2 | S2 | S2-04 |
| NFR-14 | Search results return within 2 seconds (target). | `platform` | P1 | S2 | S2-04 |
| NFR-15 | Supports at least 1,000 concurrent users. | `platform` | P1 | S3 | S3-13 |
| NFR-16 | Acceptable performance maintained on slow mobile internet connections (3G/4G). | `platform` | P1+P2 | S2 | S2-04 |
| NFR-17 | Property photographs optimised to reduce loading time and mobile data consumption (WebP format). | `platform` | P1 | S1 | S1-09 |
| NFR-18 | Efficient booking and availability checks maintained under concurrent requests. | `platform` | P1 | S2 | S2-08 |
| NFR-19 | Authenticate users before granting access to protected resources. | `platform` | P1+P2 | S1 | S1-04 |
| NFR-20 | Enforce role-based authorisation (RBAC). | `platform` | P1+P2 | S1 | S1-06 |
| NFR-21 | Protect sensitive information during transmission (HTTPS/TLS) and storage (encryption at rest). | `platform` | P1+P2 | S1 | S1-06 |
| NFR-22 | Secure password hashing managed by Supabase Auth; FindStay never stores or hashes passwords. | `platform` | P1+P2 | S1 | S1-04 |
| NFR-23 | Validate user input; protect against SQL injection and cross-site scripting (XSS). | `platform` | P1+P2 | S1 | S1-06 |
| NFR-24 | Prevent unauthorised direct access to protected records. | `platform` | P1+P2 | S1 | S1-06 |
| NFR-25 | Protect payment transactions against fraudulent or falsified payment notifications. | `platform` | P1+P2 | S2 | S2-11 |
| NFR-26 | Never store raw payment-card information. | `platform` | P1+P2 | S2 | S2-09 |
| NFR-27 | Protect confidential application credentials and secret keys (environment variables, not source code). | `platform` | P1+P2 | S1 | S1-02 |
| NFR-28 | Protect sensitive identity information including Ghana Card details. | `platform` | P1+P2 | S1 | S1-12 |
| NFR-29 | Support optional two-factor authentication. | `platform` | P1 | S3 | S3-12 |
| NFR-30 | PCI-DSS aligned payment security. | `platform` | P1 | S3 | S3-13 |
| NFR-31 | Protect users' personal and financial information. | `platform` | P1+P2 | S1 | S1-11 |
| NFR-32 | Comply with Ghana's Data Protection Act, 2012 (Act 843). | `platform` | P1+P2 | S1 | S1-11 |
| NFR-33 | Comply with applicable payment-provider requirements. | `platform` | P1+P2 | S2 | S2-09 |
| NFR-34 | Follow relevant tourism business verification and regulatory requirements. | `platform` | P1 | S1 | S1-12 |
| NFR-35 | Restrict personal and financial information to authorised users only. | `platform` | P1+P2 | S1 | S1-11 |
| NFR-36 | Collect only necessary personal information; obtain user consent for data collection. | `platform` | P1+P2 | S1 | S1-11 |
| NFR-37 | Maintain reliable booking and payment records. | `platform` | P1+P2 | S2 | S2-10 |
| NFR-38 | Prevent duplicate confirmed bookings. | `platform` | P1 | S2 | S2-08 |
| NFR-39 | Failed or duplicate payment events must not create duplicate confirmed bookings. | `platform` | P1 | S2 | S2-11 |
| NFR-40 | Maintain consistent financial and booking records during concurrent activity. | `platform` | P1+P2 | S2 | S2-10 |
| NFR-41 | 99.5% uptime target (S1); 99% monthly uptime target (S2, S3). | `platform` | P1+P2 | S3 | S3-13 |
| NFR-42 | Provide automatic database backups (daily) and a documented restoration procedure. | `platform` | P1+P2 | S1 | S1-02 |
| NFR-43 | Provide error logging and monitoring. | `platform` | P1+P2 | S1 | S1-02 |
| NFR-44 | Support recovery from application and infrastructure failures. | `platform` | P1+P2 | S3 | S3-13 |
| NFR-45 | Support growth in properties, accommodation units, users and participating owners. | `platform` | P1+P2 | S1 | S1-01 |
| NFR-46 | Support addition of new accommodation types without core system redesign. | `platform` | P1+P2 | S1 | S1-01 |
| NFR-47 | Cloud-based architecture that scales as users, cities and listings grow. | `platform` | P1+P2 | S1 | S1-01 |
| NFR-48 | Modular structure accommodating future integrations. | `platform` | P1+P2 | S1 | S1-01 |
| NFR-49 | Maintain accurate property, booking and financial information. | `platform` | P1+P2 | S2 | S2-14 |
| NFR-50 | Prevent duplicate payment transactions from being processed as separate successful payments. | `platform` | P1+P2 | S2 | S2-11 |
| NFR-51 | Preserve the relationship between booking records and their payment transactions. | `platform` | P1+P2 | S2 | S2-10 |
| NFR-52 | Maintain accurate booking dates and times in Ghana local time (GMT). | `platform` | P1+P2 | S1 | S1-01 |
| NFR-53 | Significant financial and administrative changes shall be traceable. | `platform` | P1+P2 | S3 | S3-11 |
| NFR-54 | Modular, documented architecture enabling easy updates and integration. | `platform` | P1+P2 | S1 | S1-01 |
| NFR-55 | Provide technical and operational documentation. | `platform` | P1+P2 | S1 | S1-01 |
| NFR-56 | Support automated testing. | `platform` | P1+P2 | S1 | S1-01 |
| NFR-57 | Maintain version-controlled source code. | `platform` | P1+P2 | S1 | S1-01 |
| NFR-58 | Support future maintenance and enhancements without major architectural redesign. | `platform` | P1+P2 | S1 | S1-01 |
| NFR-59 | Integration capabilities for supported payment gateways. | `platform` | P1 | S2 | S2-09 |
| NFR-60 | Communication-service integrations: email and SMS providers. | `platform` | P1 | S1 | S1-10 |
| NFR-61 | Support integration with external accounting tools where required. | `platform` | P2 | S5 | S5-02 |
| NFR-62 | Support calendar integrations where required. | `platform` | P2 | S5 | S5-06 |
| NFR-63 | Provide REST API-based integration capabilities. | `platform` | P1+P2 | S1 | S1-01 |
| NFR-64 | Maintain auditable records of significant financial transactions. | `audit` | P1+P2 | S3 | S3-11 |
| NFR-65 | Maintain records of important booking, reservation and administrative changes. | `audit` | P1+P2 | S3 | S3-11 |
| NFR-66 | Audit records shall identify the action, user and date/time. | `audit` | P1+P2 | S1 | S1-08 |

### A.4 Business requirements (12)

| ID | Requirement | Module | Phase | Sprint | Story |
|----|-------------|--------|:-----:|:------:|-------|
| BR-01 | FindStay shall provide a central platform for discovering accommodation in Ghana. | `platform` | P1 | S2 | S2-01 |
| BR-02 | The platform shall initially focus on Takoradi as its proposed local pilot context. | `platform` | P1 | S1 | S1-13 |
| BR-03 | The platform shall support hotels, budget hotels, guesthouses, student hostels and serviced/short-stay apartments. | `catalog` | P1+P2 | S1 | S1-13 |
| BR-04 | The platform shall improve online visibility of accommodation providers. | `search` | P1 | S2 | S2-01 |
| BR-05 | The platform shall reduce fragmentation of accommodation information across informal channels. | `platform` | P1 | S2 | S2-03 |
| BR-06 | The platform shall reduce booking conflicts and double-bookings. | `availability` | P1 | S2 | S2-08 |
| BR-07 | The platform shall support local Ghanaian payment methods and operate in Ghanaian Cedis (GHS). | `payments` | P1+P2 | S2 | S2-10 |
| BR-08 | The platform shall provide property owners with tools for managing bookings, income and expenses. | `finance` | P1 | S3 | S3-04 |
| BR-09 | The platform shall provide administrators with tools for platform oversight, verification and dispute resolution. | `admin` | P1+P2 | S3 | S3-07 |
| BR-10 | The platform shall provide an accessible solution suitable for small and medium-sized accommodation providers. | `platform` | P1+P2 | S1 | S1-03 |
| BR-11 | The platform shall support accountability through verification, audit records and administrative controls. | `audit` | P1+P2 | S1 | S1-08 |
| BR-12 | The platform shall support a sustainable revenue model including host booking commission, guest convenience fee, sponsored listings, premium subscription tier and optional verification/photography packages. | `payments` | P1+P2 | S2 | S2-10 |

### A.5 Business rules (20)

| ID | Requirement | Module | Phase | Sprint | Story |
|----|-------------|--------|:-----:|:------:|-------|
| BRL-01 | Users must authenticate before accessing protected account, booking, financial, messaging, review or administrative functions. | `identity` | P1+P2 | S1 | S1-04 |
| BRL-02 | Each account shall have one primary role. | `identity` | P1 | S1 | S1-06 |
| BRL-03 | Only administrator-approved listings are publicly searchable and bookable. | `verification` | P1 | S2 | S2-03 |
| BRL-04 | Additional property-staff access must be explicitly granted by an authorised owner/manager or administrator. | `organization` | P1 | S1 | S1-07 |
| BRL-05 | Owners/managers and staff may access only properties and financial records they are authorised for. | `organization` | P1+P2 | S1 | S1-07 |
| BRL-06 | Listings must contain the minimum required information before submission for approval. | `catalog` | P1 | S1 | S1-13 |
| BRL-07 | Overlapping confirmed bookings for the same unit and dates are not permitted. | `availability` | P1 | S2 | S2-08 |
| BRL-08 | Booking flow: Pending → Awaiting Payment (on owner acceptance) → Confirmed (only after verified payment). | `booking` | P1 | S2 | S2-07 |
| BRL-09 | Unpaid bookings are automatically cancelled after the payment window expires (30 minutes); the unit is released. | `booking` | P1 | S2 | S2-07 |
| BRL-10 | Declined, cancelled and expired bookings shall not block accommodation availability. | `availability` | P1 | S2 | S2-08 |
| BRL-11 | A booking may be marked Completed only after the relevant stay has ended and check-out has been recorded. | `booking` | P1 | S2 | S2-12 |
| BRL-12 | Only guests associated with completed bookings may submit reviews; one review per completed booking. | `review` | P1 | S3 | S3-06 |
| BRL-13 | Administrators may hide or remove reported reviews through recorded moderation decisions. | `review` | P1 | S3 | S3-06 |
| BRL-14 | Refunds follow the recorded cancellation policy and are never automatic. | `payments` | P1 | S3 | S3-01 |
| BRL-15 | Duplicate payment notifications must not result in duplicate payment processing. | `payments` | P1+P2 | S2 | S2-11 |
| BRL-16 | Income from confirmed booking payments shall be recorded against the relevant property. | `finance` | P1 | S3 | S3-04 |
| BRL-17 | Only authorised property users may add or amend expense records. | `finance` | P1+P2 | S3 | S3-04 |
| BRL-18 | Relevant users must be notified when booking, payment, verification, complaint, dispute or review statuses change. | `notification` | P1+P2 | S3 | S3-10 |
| BRL-19 | Suspension and restoration decisions must be recorded in audit logs. | `audit` | P1 | S1 | S1-08 |
| BRL-20 | Financial and administrative actions must create auditable records. | `audit` | P1+P2 | S3 | S3-11 |

### A.6 Technical / architecture (13)

| ID | Requirement | Module | Phase | Sprint | Story |
|----|-------------|--------|:-----:|:------:|-------|
| TA-01 | Web-based application with three-layer architecture: Presentation · Application/Business Logic · Data and Services. | `platform` | P1+P2 | S1 | S1-01 |
| TA-02 | Frontend communicates with backend through REST API requests. | `platform` | P1+P2 | S1 | S1-01 |
| TA-03 | Dedicated interfaces for guests, property owners and administrators. | `platform` | P1+P2 | S2 | S2-04 |
| TA-04 | Integrate with Paystack Ghana; support MTN Mobile Money, Telecel Cash, AT Money and bank cards. | `payments` | P1 | S2 | S2-09 |
| TA-05 | Validate payment webhook signatures (HMAC-SHA512). | `payments` | P1+P2 | S2 | S2-11 |
| TA-06 | Maintain transaction references and payment timestamps. | `payments` | P1+P2 | S2 | S2-10 |
| TA-07 | Password hashing is managed by Supabase Auth; application code never stores or hashes passwords. | `identity` | P1+P2 | S1 | S1-04 |
| TA-08 | Supabase JWT-based authentication with one-hour access tokens and managed refresh-token rotation; Spring validates JWTs through JWKS. | `identity` | P1+P2 | S1 | S1-04 |
| TA-09 | Encryption of sensitive identification information at rest. | `platform` | P1+P2 | S1 | S1-12 |
| TA-10 | No storage of raw payment-card credentials. | `payments` | P1+P2 | S2 | S2-09 |
| TA-11 | Secure storage of database passwords and payment-provider secret keys (environment variables). | `platform` | P1+P2 | S1 | S1-02 |
| TA-12 | Property photographs stored using Supabase Storage. | `media` | P1+P2 | S1 | S1-09 |
| TA-13 | Images compressed, optimised and served in modern lightweight formats (WebP). | `media` | P1+P2 | S1 | S1-09 |

### A.7 Project / deployment (13)

| ID | Requirement | Module | Phase | Sprint | Story |
|----|-------------|--------|:-----:|:------:|-------|
| PD-01 | Documented requirements analysis and system design. | `platform` | P1+P2 | S1 | S1-01 |
| PD-02 | Database design and implementation. | `platform` | P1+P2 | S1 | S1-01 |
| PD-03 | Core account, access, listing, search, booking and payment functionality. | `platform` | P1 | S2 | S2-14 |
| PD-04 | Owner and administrator operational modules. | `platform` | P1 | S3 | S3-14 |
| PD-05 | Security testing and user-acceptance testing. | `platform` | P1+P2 | S3 | S3-14 |
| PD-06 | Deployment to cloud infrastructure (frontend via Cloudflare Workers Static Assets/CDN; Spring Boot on Render; database and storage on Supabase). | `platform` | P1+P2 | S1 | S1-02 |
| PD-07 | Module-level, workflow/integration and user-acceptance testing. | `platform` | P1+P2 | S1 | S1-01 |
| PD-08 | Test authentication, authorisation, search/filtering, booking-conflict prevention, payment verification and timeout. | `platform` | P1+P2 | S2 | S2-14 |
| PD-09 | Test financial calculations, review eligibility, property verification/approval and mobile responsiveness. | `platform` | P1+P2 | S3 | S3-14 |
| PD-10 | Backend application-health monitoring. | `platform` | P1+P2 | S1 | S1-02 |
| PD-11 | Daily automated database backups. | `platform` | P1+P2 | S1 | S1-02 |
| PD-12 | Confidential credentials stored in secure environment settings, not source code. | `platform` | P1+P2 | S1 | S1-02 |
| PD-13 | Deployment must support real users. | `platform` | P1+P2 | S3 | S3-14 |

---

**Validation.** A script parsed every requirement row of the phased plan (Sections 7 and 8), found 304 distinct IDs, and confirmed that each appears exactly once in the sprint backlogs above, with none missing and none extra.
