# S1-01: Walking skeleton, CI and module-boundary gate

**Details:** Pri M, track A, D1 to D3
**Acceptance Criteria:** [See S1-01 in acceptance-criteria.md](../acceptance-criteria/acceptance-criteria.md)

## What Needs to Be Done
- *Done when:* Empty app builds, tests and deploys from CI; the build fails if a module imports another module's internals.
- *Database:* Render PostgreSQL with one schema per module; Flyway is the only application-schema migration authority and establishes the S1 range V1_01 to V1_19; `btree_gist` extension; ERD for the S1 modules reviewed against the eight seams. React has no direct database access to FindStay business tables.
- *API:* Spring Boot 3 on JDK 21; Spring Modulith `verify()` in CI; shared kernel (Money in pesewas, UTC timestamptz with Ghana-time rendering, IDs, error model, domain events, scheduler); OpenAPI per module.
- *UI:* Vite + React + Tailwind app; portal router for guest, owner and admin; one feature folder per backend module.
- *Tests:* Testcontainers PostgreSQL harness; requirement-tag annotation (`@Req("FR-40")`) on tests; docs folder (architecture note, ERD, OpenAPI).
