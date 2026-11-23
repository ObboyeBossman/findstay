# FindStay — Sprint 5: Accountants, Student Hostels and Final Release

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

### 3.6 Capacity check

Before Sprint Planning, record available person-days after classes, exams, public holidays and standing project work. Reserve 20% for integration, testing, review and documentation, plus the defect reserve above; commit new stories only from the capacity that remains. Tracks A, B and C are work streams, not a promise of parallel staffing. This final sprint has no later buffer, so capacity pressure moves Could stories and unresolved hostel scope out of the ten-week plan before it reduces regression, acceptance or release work.

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
