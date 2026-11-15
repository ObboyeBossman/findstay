# FindStay — Sprint 1: Foundation and Verified Owner Listings

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

Before Sprint Planning, record available person-days after classes, exams, public holidays and standing project work. Reserve 20% for integration, testing, review and documentation, plus the defect reserve above; commit new stories only from the capacity that remains. Tracks A, B and C are work streams, not a promise of parallel staffing. At the Sprint 1 Review, re-estimate every later sprint from the team's actual throughput. If less than 85% of committed work is Done, remove Could stories first and then move complete Should stories through change control; do not weaken the Definition of Done.

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
