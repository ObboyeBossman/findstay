# FindStay agent guide

## Product and current state

FindStay is a Ghana-focused accommodation marketplace and property-management system for guests, property owners/staff, and platform administrators. It supports local verification, availability, protected bookings, Mobile Money/card payments, and owner operations.

This repository is a foundation, not a completed product: `web/src/App.tsx` is intentionally empty; API modules currently contain boundary placeholders; and `V1_01__init.sql` only enables `btree_gist`. Do not present planned features as implemented.

## Map

- `web/` — React + TypeScript + Vite application for guests, owners, and admins.
- `api/` — Java 21 / Spring Boot 3 modular monolith with Spring Modulith and Flyway/PostgreSQL.
- `docs/` — approved requirements, architecture contracts, sprint material, and evidence; it is the product source of truth.
- `showcase/` — separate Vite site for sprint-progress presentation, not the product UI.
- `scripts/` — maintenance utilities; `sync-project.mjs` reads the GitHub Project board and refreshes cached evidence.

## Context before changing code

1. Read the nearest `AGENTS.md` for the directory being changed.
2. Start with `docs/overview.md`; follow only the requirement, story, or rule documents relevant to the request. Do not bulk-read `docs/`.
3. For application or schema work, read `docs/rules/architecture-and-security.md`, `docs/rules/module-boundaries.md`, and `docs/rules/no-conflict-contract.md`.
4. For a story-sized change, use the repo skill `$findstay-story-delivery`.
5. For project discovery, backlog, sprint, team-assignment, or GitHub Project work, use `$findstay-scrum`.

## Non-negotiable platform rules

- Browser business-data access goes through `/api/v1/...`; Supabase is for Auth only. The API validates Supabase JWTs via JWKS.
- Enforce organisation isolation (`OrgScope`) on every owner-scoped read or write.
- Store money as integer GHS pesewas, keep timestamps in UTC, and format for `Africa/Accra` only at presentation boundaries.
- Protect sensitive data: no secrets in source; private documents use authorised, short-lived access; audit sensitive actions.
- Keep database migrations, REST contracts, and domain events backward compatible and additive. Never edit an applied Flyway migration.
- Cross-module API code uses `shared`, public `api` packages, or domain events—not another module's `internal` package, entity, or repository.

## Useful commands

Run from the repository root unless stated otherwise:

```bash
npm run typecheck              # web TypeScript check
npm run build                  # web production build
npm run build:showcase         # progress-showcase build
(cd api && mvn test)           # API tests and Modulith boundary check
npm run sync:project           # authenticated GitHub board refresh; deliberate, not routine
```

Do not edit generated `dist/` output or commit secrets. When configuration changes, update the appropriate checked-in `.env.example` without values. Keep a change focused; update requirements, decision, or evidence documents only when the behaviour or delivery record changes.

## Git workflow & identity

- Work on `dev`; never push directly to protected branches (`main`, `staging`).
- Ensure the local Git commit identity is set to `ObboyeBossman` (`obboyebossman@gmail.com`) before committing.
