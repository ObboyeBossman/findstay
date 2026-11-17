# findstay-api

Java 21 / Spring Boot 3 modular monolith (Spring Modulith) with Flyway/PostgreSQL.
Module boundaries and layout rules: [`api/AGENTS.md`](./AGENTS.md) ·
[`docs/rules/module-boundaries.md`](../docs/rules/module-boundaries.md).

## Database migrations — how to run them locally

The database schema is created **only** by the numbered Flyway scripts in
[`src/main/resources/db/migration/`](./src/main/resources/db/migration/).
Never change the database by hand; never edit a script that has already run
anywhere (add a new one instead). Sprint 1 owns the `V1_01`–`V1_19` range;
the next free version today is **`V1_13`** (T15's reference-list seeds).

| Script | Module / contents |
| :--- | :--- |
| `V1_01` | `btree_gist` extension (project setup) |
| `V1_02` | Spring Modulith `event_publication` (project setup) |
| `V1_03` | lookup tables: `listing.accommodation_type`, `listing.billing_period`, `admin.platform_setting` (structure; **values are T15's**, issue #24) |
| `V1_04` | `identity` — accounts, profiles, RBAC catalogue + the 4 seeded platform roles |
| `V1_05` | `organization` — companies, memberships, invitations |
| `V1_06` | `media` — R2 asset registry + the single ownership link |
| `V1_07` | `verification` — cases, documents, review decisions, consents |
| `V1_08` | `listing` — properties, units, rate plans, amenities, areas, photos, the public projection, status history |
| `V1_09` | `availability` — calendar blocks + the overlap exclusion constraint |
| `V1_10` | `audit` — the append-only trail |
| `V1_11` | `notification` — inbox, templates, preferences, delivery log |
| `V1_12` | the `findstay_app` DB role and all grants (grants last) |

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

## Adding a migration (the rules)

1. Next free version in the sprint's range (`V1_13` today), two underscores,
   snake-case description: `V1_13__seed_reference_lists.sql`.
2. Additive only: new tables, columns, indexes, grants, seed rows. Never
   edit an applied migration; never rename or drop what stories already use.
3. Cross-module references are **logical uuid columns, not FKs** (ERD §5);
   FKs stay inside one module's schema.
4. Seed inserts are idempotent: `ON CONFLICT DO NOTHING` (or an equivalent
   guard).
5. Money is `bigint` pesewas with `currency = 'GHS'`; timestamps are
   `timestamptz` provided by the application; no triggers in Sprint 1.
