# findstay-api

Java 21 / Spring Boot 3 modular monolith (Spring Modulith) with Flyway/PostgreSQL.
Module boundaries and layout rules: [`api/AGENTS.md`](./AGENTS.md) ·
[`docs/rules/module-boundaries.md`](../docs/rules/module-boundaries.md).

## Database migrations — how to run them locally

The database schema is created **only** by the numbered Flyway scripts in
[`src/main/resources/db/migration/`](./src/main/resources/db/migration/).
Never change the database by hand; never edit a script that has already run
anywhere (add a new one instead). Sprint 1 owns the `V1_01`–`V1_19` range;
the next free version today is **`V1_14`**.

| Script | Module / contents |
| :--- | :--- |
| `V1_01` | `btree_gist` extension (project setup) |
| `V1_02` | Spring Modulith `event_publication` (project setup) |
| `V1_03` | lookup tables: `listing.accommodation_type`, `listing.billing_period`, `admin.platform_setting` (structure; values are T15's, issue #24) |
| `V1_04` | `identity` — accounts, profiles, RBAC catalogue + the 4 seeded platform roles |
| `V1_05` | `organization` — companies, memberships, invitations |
| `V1_06` | `media` — R2 asset registry + the single ownership link |
| `V1_07` | `verification` — cases, documents, review decisions, consents |
| `V1_08` | `listing` — properties, units, rate plans, amenities, areas, photos, the public projection, status history |
| `V1_09` | `availability` — calendar blocks + the overlap exclusion constraint |
| `V1_10` | `audit` — the append-only trail |
| `V1_11` | `notification` — inbox, templates, preferences, delivery log |
| `V1_12` | the `findstay_app` DB role and all grants (grants last) |
| `V1_13` | the starter reference values (T15): 7 accommodation types, 4 billing periods (only `NIGHTLY` active), 3 platform settings (`privacy.policy_version`, `flag.auth.sms_otp`, `flag.notifications.sms`) |

### Option A — let the app do it (recommended)

```bash
createdb findstay                       # once; PostgreSQL 16+
cp .env.example .env                    # set SPRING_DATASOURCE_PASSWORD etc.
mvn spring-boot:run                     # or your IDE's run config
```

Flyway is enabled in `application.yml` and applies every pending migration
on startup, in order, inside the `findstay` database.

### Option B — psql by hand (quick inspection)

```bash
createdb findstay
psql findstay -f src/main/resources/db/migration/V1_01__init.sql   # etc., in order
```

Every script is idempotent (`IF NOT EXISTS` / `ON CONFLICT DO NOTHING`), so
re-running one by hand is safe. Note: hand-applied scripts are **not**
recorded in `flyway_schema_history`; run `mvn spring-boot:run` (or option C)
once afterwards so Flyway adopts the schema instead of re-applying it.

### Option C — the Flyway CLI (what staging does)

```bash
flyway -url=jdbc:postgresql://localhost:5432/findstay \
       -user=postgres \
       -locations=filesystem:src/main/resources/db/migration \
       migrate
```

## The `findstay_app` role (why audit is tamper-proof)

`V1_12` creates a **group role** `findstay_app` that carries exactly the
privileges the running application needs — including `INSERT` + `SELECT`
**only** on `audit.audit_log` (S1-08: audit rows cannot be edited or deleted,
even at the database role level). To use it, make the deployment's login
user a member, once, outside the migrations:

```sql
GRANT findstay_app TO "<your-login-user>";   -- e.g. the Render PostgreSQL user
SET ROLE findstay_app;                      -- try it: UPDATE audit.audit_log → denied
```

In local dev the app usually connects as the database owner (`postgres`),
which bypasses grants — that is fine for everyday work; the grants are the
staging/production guarantee and are exercised by T12's throwaway-database
tests.

## The starter reference values (T15, `V1_13`)

Every environment starts with exactly these rows (fixed UUIDv7 ids and
`ON CONFLICT DO NOTHING`, so re-running never duplicates — decision
[`DEC-S1-01/L`](../docs/decisions/dec-s1-01-t15-reference-lists.md)):

- `listing.accommodation_type` — the seven kickoff types, all active:
  `Single Room`, `Double Room`, `Studio`, `Suite`, `1-Bedroom Apartment`,
  `2-Bedroom Apartment`, `Entire House`.
- `listing.billing_period` — `Per Night` (`NIGHTLY`) is the only active
  Sprint 1 period; `MONTHLY`, `PER_TERM`, `ACADEMIC_YEAR` are seeded **off**
  for the long-stay/hostel sprints. No weekly, ever.
- `admin.platform_setting` — `privacy.policy_version` (`1`, the version
  S1-11 consent records reference), `flag.auth.sms_otp` (off — email links
  are the R1 method, kickoff decision 1), `flag.notifications.sms` (off —
  In-App + Email first, kickoff decision 4).

Future value changes are **new migrations** (`V1_14+`), never edits to
`V1_13`. Admins manage the settings table at runtime from S1-16.

## The public health surface (what CI and the website call)

- `GET /api/v1/health` — the platform health under the API's own prefix
  (TA-02); the website's footer SystemStatus and the CI deploy check call
  this. `200 {"status":"UP","components":{…}}` when healthy, `503` with
  `{"status":"DOWN"}` when not — component statuses and the standard
  actuator health details only (database product, disk space), never
  application data.
- **CORS** (TA-02): the browser is allowed to call `/api/v1/...` from
  `findstay.cors.allowed-origins` (local dev + the staging website by
  default; production adds its origin with the hosting story S1-02).
  Credentials are never sent — the API is a bearer-token API.
- `GET /actuator/health` and `GET /actuator/info` — public too (`info` carries
  the build identity from the `build-info` plugin, so a deploy can be
  verified as *the new build*, not the previous one).
- Everything else requires a Supabase JWT (JWKS-validated) — one
  `SecurityConfig` rule in `shared`, the business endpoints layer their
  authorization on top of it.

## Tests — the throwaway database and the `@Req` rule (S1-01-T12)

```bash
mvn test        # everything: unit tests, the @Req check, the Modulith boundary check
```

**Integration tests run against a real PostgreSQL**, started per run in a
Docker container, migrated from scratch by the real Flyway scripts, and
thrown away afterwards — real DDL constraints, real grants, real SQL
semantics; nothing mocked, nothing H2. To write one:

```java
@Req("S1-08-AC2")                       // the requirement this test proves
class MyRuleIntegrationTest extends AbstractIntegrationTest {

    @Autowired JdbcTemplate jdbc;       // real database access

    @Test
    void myRuleBites() { … }
}
```

- Extend `com.findstay.testing.AbstractIntegrationTest` (base class javadoc
  documents the lifecycle: one PostgreSQL 16 per run, fresh state per test
  via `@Transactional` rollback, Ryuk cleans up, loud skip when Docker is
  missing — CI always has Docker and runs the suite for real).
- Label every test class (or each method) with `@Req("…")` — a requirement
  id (`NFR-38`), decision id (`DEC-S1-01/L`), story AC (`S1-08-AC2`),
  sprint invariant (`C5`) or foundation task (`S1-01-T7`). The convention and
  accepted values are documented on the annotation.
- `RequirementTaggingTest` enforces the rule and **fails the build on an
  unlabelled or blank-labelled test** — the check carries its own proof
  (a deliberately untagged sample class that the detector must flag).
- The working example is `ThrowawayDatabaseHarnessTest`: it proves the
  migrations apply cleanly on the throwaway DB, the T15 reference values are
  present, real writes roll back per test, `audit.audit_log` is append-only
  under `findstay_app` (S1-08 AC 2), and overlapping availability blocks are
  rejected (S1-14 AC 2).

## Adding a migration (the rules)

1. Next free version in the sprint's range (`V1_14` today), two underscores,
   snake-case description: `V1_14__your_change.sql`.
2. Additive only: new tables, columns, indexes, grants, seed rows. Never
   edit an applied migration; never rename or drop what stories already use.
3. Cross-module references are **logical uuid columns, not FKs** (ERD §5);
   FKs stay inside one module's schema.
4. Seed inserts are idempotent: `ON CONFLICT DO NOTHING` (or an equivalent
   guard).
5. Money is `bigint` pesewas with `currency = 'GHS'`; timestamps are
   `timestamptz` provided by the application; no triggers in Sprint 1.
