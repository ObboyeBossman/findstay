# FindStay Project Rules (`.rules/`)

This directory defines the binding engineering, architecture, module-boundary, and delivery rules for the **FindStay** platform across all five sprints (Phase 1: Sprints 1–3; Phase 2: Sprints 4–5).

## Rule Files

1. [`01-no-conflict-contract.md`](./01-no-conflict-contract.md) — **The No-Conflict Contract (C1–C8)**: additive-only database migrations, per-sprint Flyway ranges, non-breaking OpenAPI evolution, append-only domain events, one-way module dependencies, public seams, dark feature flags, and reversible releases.
2. [`02-module-boundaries-and-regression.md`](./02-module-boundaries-and-regression.md) — **Module Boundaries, Seams & Regression Chain (R1–R5)**: Spring Modulith package isolation, the "Who May Call Whom" matrix, the 8 cross-sprint extension seams, cumulative regression suites (`R1`–`R5`), and `@Req("...")` requirement test tags.
3. [`03-architecture-and-security.md`](./03-architecture-and-security.md) — **Architecture, Stack & Security Rules**: approved stack (Cloudflare Workers Static Assets, Spring Boot 3 / Java 21 on Render, Supabase Auth / PostgreSQL / Storage), zero direct frontend Data API access, JWT/JWKS verification, multi-tenant `OrgScope` isolation, integer pesewa money arithmetic, UTC `timestamptz` storage, and Act 843 compliance.
4. [`04-scrum-delivery-and-gates.md`](./04-scrum-delivery-and-gates.md) — **Scrum Delivery, Quality Gates & Priorities**: Definition of Ready (DoR), Definition of Done (DoD), Must/Should/Could execution order, Day 8 feature freeze, and unfinished-work spill rules.
5. [`05-settled-decisions.md`](./05-settled-decisions.md) — **Settled Stakeholder Decisions (Sprint 1)**: binding resolutions for `J-06`, `P-02`, `P-04`, `P-08`, `P-09`, and `P-12`, plus the schedule of Sprint 2–5 decision gates.
6. [`06-design-system-and-theming.md`](./06-design-system-and-theming.md) — **Design System & Theming (T1)**: single token source of truth (`web/src/theme/tokens.css`), semantic colour/type/spacing/shape classes, the ban on hard-coded colours, spacing, sizes, fonts, z-index and durations, the `cn()` helper, the `npm run lint:theme` guard, and the process for adding a token.
