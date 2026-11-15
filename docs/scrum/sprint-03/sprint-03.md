# FindStay — Sprint 3: Operate, Trust and Go-Live

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

Before Sprint Planning, record available person-days after classes, exams, public holidays and standing project work. Reserve 20% for integration, testing, review and documentation, plus the defect reserve above; commit new stories only from the capacity that remains. Tracks A, B and C are work streams, not a promise of parallel staffing. Re-estimate this Sprint Backlog from the team's actual throughput and protect the Phase 1 exit gate: capacity pressure removes Could stories before any acceptance, security, recovery or release work.

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
