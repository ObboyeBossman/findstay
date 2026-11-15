# 02 — Module Boundaries, Seams & Regression Chain (R1–R5)

## 1. Who May Call Whom

Each module exposes a public `api` package and keeps its entities, repositories, and services inside `internal`.

| Caller Sprint / Module | Allowed Dependencies | Forbidden Dependencies |
| :--- | :--- | :--- |
| **Sprint 1** (`shared`, `identity`, `verification`, `listing`, `availability`, `notification`, `admin`) | `shared` kernel (`Money`, `OrgScope`, `Clock`, `AuditRecorder`, event bus) and earlier Sprint 1 `api` interfaces (`CatalogQuery`, `AvailabilityGate`, `NotificationSender`). | Any Sprint 2–5 module; any other module's `internal` package or JPA repositories. |
| **Sprint 2** (`search`, `booking`, `payment`, `messaging`, `review`) | `shared` + Sprint 1 public `api` packages and domain events (`CatalogQuery`, `AvailabilityGate`, `NotificationSender`, `AuditRecorder`). | Sprint 1 `internal` packages; direct writes to `listing` or `identity` tables; Sprint 3–5 modules. |
| **Sprint 3** (`payout`, `refund`, `dispute`, `reporting`, `hardening`) | `shared` + Sprint 1 & Sprint 2 public `api` packages and the frozen Sprint 2 domain event catalog. | Adding new booking states or mutating Sprint 1/2 internal repositories. |
| **Sprint 4** (`tenancy`, `lease`, `rent`, `maintenance`) | `shared` + Phase 1 (Sprints 1–3) public `api` packages, events, and the 8 extension seams. | Modifying Phase 1 short-stay booking/payout internals; Sprint 5 modules. |
| **Sprint 5** (`hostel`, `bed_allocation`, `calendar_sync`, `ai_assistant`) | `shared` + Phase 1 and Sprint 4 public `api` packages, events, and extension seams. | Modifying Phase 1 or Sprint 4 internal packages. |

---

## 2. The Eight Extension Seams (Established in Sprint 1)

1. **Blocked-Dates & Exclusion Seam (`availability_block`)**: Uses a `reason` lookup (`OWNER_BLOCK` in S1; `HOLD` and `BOOKING` added via migration in S2) plus a PostgreSQL ` tstzrange` exclusion constraint (`EXCLUDE USING gist`) so overlapping blocks are rejected at the database level.
2. **Listing Lookup Seam (`CatalogQuery`)**: Public read interface in `listing.api` returning published listing/unit projections so Sprint 2 search never touches `listing.internal`.
3. **Billing Period Seam (`billing_period`)**: Lookup table seeded with `NIGHTLY` active in Phase 1; `MONTHLY`, `TERM`, and `ACADEMIC_YEAR` are seeded inactive and enabled in Sprints 4–5.
4. **Message Template Seam (`notification_template`)**: Keyed by event type (`LISTING_APPROVED`, `BOOKING_CONFIRMED`, etc.); later sprints register templates via Flyway data migrations without changing `NotificationSender`.
5. **Activity Log Seam (`AuditRecorder`)**: Records generic `(actor_id, org_id, action, entity_type, entity_id, metadata_json, created_at)` entries in an append-only table reused by all modules.
6. **Roles & Permissions Seam (`role_permission`)**: Permission codes stored as rows with module prefixes (`listing.*`, `booking.*`, `payment.*`, `tenancy.*`, `hostel.*`).
7. **Settings & Feature Flags Seam (`platform_setting`)**: Key-value configuration and feature switches (`flag.*`) supporting dark launches (`C7`).
8. **Shared Kernel Primitives (`shared`)**: `OrgScope` tenant filter, `Money` (integer pesewas), UTC `Clock` + `Africa/Accra` formatting, scheduler wrapper, and domain event publisher.

---

## 3. Cumulative Regression Chain (`R1`–`R5`)

Every automated test carries a `@Req("FR-xx")` / `@Req("NFR-xx")` / `@Req("SEC-xx")` tag. Earlier regression suites are **never disabled**; a failure in an earlier suite blocks the current sprint release.

- **`R1` (Sprint 1 Gate):** All Sprint 1 unit, integration, tenant-isolation, and backup/restore smoke tests.
- **`R2` (Sprint 2 Gate):** `R1` + Sprint 2 search, booking concurrency, payment webhook idempotency, messaging, and review tests.
- **`R3` (Sprint 3 / Phase 1 Gate):** `R1` + `R2` + Sprint 3 payout, refund, dispute, load/performance (`NFR-01`..`NFR-05`, `NFR-13`), and Phase 1 seam contract tests.
- **`R4` (Sprint 4 Gate):** `R1` + `R2` + `R3` + Sprint 4 long-stay tenancy/lease tests + Spring Modulith verification proving zero Phase 1 boundary violations.
- **`R5` (Sprint 5 / Final Gate):** `R1`–`R4` + Sprint 5 hostel/student-housing tests + full OWASP & security re-verification across all modules.
