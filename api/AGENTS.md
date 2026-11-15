# API agent guide

## Scope and structure

`api/` is the Java 21 / Spring Boot 3 backend. It is a Spring Modulith modular monolith rooted at `com.findstay`. The current module directories are intentional seams; most contain only `.gitkeep` files until their stories are implemented.

Place each module's externally callable types in `com.findstay.<module>.api`; keep controllers, services, entities, and repositories in `internal`. Use `shared` only for genuinely cross-cutting primitives. Do not bypass these seams with cross-module JPA access.

## Data and security

- The API, not the browser, owns business-data and R2 access. Accept Supabase bearer tokens and validate them through the configured JWKS resource server.
- Apply `OrgScope` to every organisation-owned query and mutation. Never trust a client-supplied organisation identifier as authority.
- Use integer pesewas for money; use UTC for persisted times; validate all externally supplied input.
- Sensitive administrative and verification actions need audit records. Keep government-ID data encrypted and documents in the private bucket behind authorised pre-signed URLs.

## Database and compatibility

Flyway files live in `src/main/resources/db/migration`. Add a new, additive migration; never rewrite a migration that may have run elsewhere. Confirm the active sprint before choosing a version: S1 `V1_01`–`V1_19`, S2 `V1_20`–`V1_39`, S3 `V1_40`–`V1_59`, S4 `V2_01`–`V2_29`, S5 `V2_30`–`V2_59`.

Keep `/api/v1` payloads and domain events backward compatible. Tests should cover acceptance criteria and retain requirement traceability where the project test convention provides it. Run `mvn test` after API changes; it includes the Modulith structure check.
