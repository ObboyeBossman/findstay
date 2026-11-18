# FindStay — Sprint 2: Search, Book and Pay

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

Before Sprint Planning, record available person-days after classes, exams, public holidays and standing project work. Reserve 20% for integration, testing, review and documentation, plus the defect reserve above; commit new stories only from the capacity that remains. Tracks A, B and C are work streams, not a promise of parallel staffing. Re-estimate this Sprint Backlog from the team's actual Sprint 1 throughput. If capacity is insufficient, remove Could stories first and then move complete Should stories through change control; do not weaken the Definition of Done.

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
| 2 | S1 public APIs and events: listing, availability, organisation, identity, media, notification, audit | S1 internals |
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
- *Database:* Search read model over listing (read-only), including nullable rating columns.
- *API:* Search endpoint with pagination and sorting; reads only `CatalogQuery` and the availability read API.
- *UI:* Guest search page and results list.
- *Tests:* Only Published listings appear; empty-result message; response time measured.

**S2-02 Filters: type, price, amenities, capacity, dates, rating** (Pri M, track A, D2 to D4)

- *Done when:* Every filter works alone and combined; date filtering uses the availability read API; the rating filter works as soon as ratings exist.
- *API:* Filter-provider interface with one provider per filter.
- *UI:* Filter panel (mobile drawer). Saved Sprint 2 progressive-disclosure chip/sheet UI concept and alignment notes: [filter-ui-concept.md](./filter-ui-concept.md).
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
