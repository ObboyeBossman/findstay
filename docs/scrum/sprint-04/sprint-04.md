# FindStay — Sprint 4: Long-Term Rentals and Maintenance

> Standalone working document extracted from [the master sprint plan](../findstay-scrum-sprint-plan.md). It includes the shared delivery contract, decision gates, and this sprint’s complete backlog, tasks, demo, hand-off, and risks.

## Final technology baseline

- React + TypeScript + Vite; Tailwind CSS + shadcn/ui; TanStack Query; React Hook Form + Zod
- Supabase Auth, PostgreSQL and Storage; React uses Auth and Storage directly with a publishable key only
- Java 21 + Spring Boot 3 on Render; Spring Security OAuth2 Resource Server validates Supabase JWTs through JWKS
- Flyway, Spring Data JPA / Hibernate, HikariCP, Spring Modulith, springdoc OpenAPI, Actuator and Sentry
- Cloudflare Workers Static Assets, DNS, CDN, WAF and Turnstile; Paystack; GitHub Actions

## 3. Scrum Framework

### 3.1 Roles

| Role | Who | Responsibility |
|------|-----|----------------|
| Product Owner | Project owner / supervisor | Orders the backlog, decides the open decisions in Section 5, accepts or rejects each increment at Sprint Review. |
| Scrum Master | A team member, part-time if needed | Protects the time-boxes, removes blockers, runs the retrospective. |
| Developers | Development team | Plan and build the sprint, own quality, deploy, and demonstrate. |

### 3.2 Ten-day sprint schedule

| Day | Event | Output |
|:---:|-------|--------|
| D1 | Sprint Planning | Sprint Goal and Sprint Backlog |
| D1–D10 | Daily Check-in | Progress and blockers |
| D4 | Next-Sprint Refinement | Next sprint's stories ready |
| D5 | Mid-Sprint Check | Must stories on track; spill rule applied if needed |
| D8 | Feature Freeze | Only bug fixes merge after this point |
| D9 | Testing & Release | All tests pass; live release with backup |
| D10 | Demo & Review | Live demo, team retro, and next-sprint prep |

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

### 3.6 Capacity check

Before Sprint Planning, record available person-days after classes, exams, public holidays and standing project work. Reserve 20% for integration, testing, review and documentation, plus the 15% Phase 1 defect reserve above; commit new stories only from the capacity that remains. Tracks A, B and C are work streams, not a promise of parallel staffing. Re-estimate this Sprint Backlog from actual throughput and protect the Phase 1 stabilisation reserve before accepting additional work.

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
| J-06 | Multi-company onboarding and data isolation | S1 D1 | Yes: `organization` from day one, one shared database. |
| P-02 | Unit model (FR-15 versus FR-40) | S1 D1 | Tracked units, optionally grouped by type for display (the plan's recommendation). |
| P-04 | Role model versus BRL-02 | S1 D1 | Account has memberships; BRL-02 reworded (the plan's recommendation). |
| P-08 | Phone verification and SMS provider | S1 D2 | Choose an SMS provider on D2. Fallback: email-only OTP in R1 and FR-70 moves to Sprint 2 through change control. |
| P-09 | Token lifecycle | S1 D3 | Supabase Auth issues one-hour access JWTs and rotates refresh tokens. React refreshes through the Supabase client; Spring validates access JWTs through Supabase JWKS. Logout is handled by Supabase Auth, with session validation reserved for sensitive actions. |
| P-12 | Regulator name for Act 843 and tourism licence documents | S1 D6 | Use "Data Protection Commission or Authority" wording in notices until confirmed; licence document list from the Ghana Tourism Authority. |
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
