# S1-01: Project Setup & System Design

**Details:** Priority: Must | Track A | Days 1–3  
**Acceptance Criteria:** See [acceptance-criteria.md](./acceptance-criteria.md)

## Done When
- All Sprint 1 system designs (UI/UX wireframes, backend architecture & OpenAPI, database ERD) are documented and reviewed.
- The empty starter app builds, passes tests (including module-boundary checks), and deploys to staging from CI.

## Tasks

| Task ID | Task | Tag | Depends On | Role | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| [`S1-01-T1`](./tasks/S1-01-T1.md) | Confirm Sprint 1 requirements & open decisions | `requirements` | — | Product & Requirements | @kwesipaa643-sys | Todo |
| [`S1-01-T2`](./tasks/S1-01-T2.md) | Create design system tokens | `ui-ux` | [`S1-01-T1`](./tasks/S1-01-T1.md) | UI/UX Design | @kwesipaa643-sys | Todo |
| [`S1-01-T3`](./tasks/S1-01-T3.md) | Create user flow diagrams | `ui-ux` | [`S1-01-T1`](./tasks/S1-01-T1.md) | UI/UX Design | @dztrb | Todo |
| [`S1-01-T4`](./tasks/S1-01-T4.md) | Create mobile-first (`360px`+) wireframes | `ui-ux` | [`S1-01-T2`](./tasks/S1-01-T2.md), [`S1-01-T3`](./tasks/S1-01-T3.md) | UI/UX Design | @maskkuratahiru-wq | Todo |
| [`S1-01-T5`](./tasks/S1-01-T5.md) | Set up Vite + React + Tailwind starter & portal router | `frontend` | [`S1-01-T2`](./tasks/S1-01-T2.md), [`S1-01-T10`](./tasks/S1-01-T10.md) | Frontend Development | @maskkuratahiru-wq | Todo |
| [`S1-01-T6`](./tasks/S1-01-T6.md) | Create module architecture diagram & OpenAPI contracts | `backend` | [`S1-01-T1`](./tasks/S1-01-T1.md) | Backend Development | @joseibonsu206-gif | Todo |
| [`S1-01-T7`](./tasks/S1-01-T7.md) | Set up Spring Boot 3, Spring Modulith & shared kernel | `backend` | [`S1-01-T6`](./tasks/S1-01-T6.md), [`S1-01-T10`](./tasks/S1-01-T10.md) | Backend Development | @joseibonsu206-gif | Todo |
| [`S1-01-T8`](./tasks/S1-01-T8.md) | Create Sprint 1 Entity-Relationship Diagram (ERD) | `database` | [`S1-01-T1`](./tasks/S1-01-T1.md), [`S1-01-T6`](./tasks/S1-01-T6.md) | Database & Data | @surnuel | Todo |
| [`S1-01-T9`](./tasks/S1-01-T9.md) | Set up Render PostgreSQL schemas & Flyway `V1_01`–`V1_19` | `database` | [`S1-01-T8`](./tasks/S1-01-T8.md) | Database & Data | @surnuel | Todo |
| [`S1-01-T10`](./tasks/S1-01-T10.md) | Set up monorepo, branch protection & staging environments | `devops` | — | Architecture, Cloud & Security | @ObboyeBossman | Todo |
| [`S1-01-T11`](./tasks/S1-01-T11.md) | Configure CI/CD pipeline with `ApplicationModules.verify()` | `devops` | [`S1-01-T5`](./tasks/S1-01-T5.md), [`S1-01-T7`](./tasks/S1-01-T7.md), [`S1-01-T10`](./tasks/S1-01-T10.md) | Architecture, Cloud & Security | @ObboyeBossman | Todo |
| [`S1-01-T12`](./tasks/S1-01-T12.md) | Set up Testcontainers PostgreSQL harness & `@Req` test tags | `testing` | [`S1-01-T7`](./tasks/S1-01-T7.md), [`S1-01-T9`](./tasks/S1-01-T9.md) | QA & Testing | @badu12-png | Todo |
| [`S1-01-T13`](./tasks/S1-01-T13.md) | Prepare Sprint 1 UAT & regression test plan | `testing` | [`S1-01-T1`](./tasks/S1-01-T1.md) | QA & Testing | @fummey | Todo |
| [`S1-01-T14`](./tasks/S1-01-T14.md) | Run Sprint 1 kickoff & assign tasks | `lead-scrum` | — | Team Lead & Scrum Master | @dztrb | Todo |
| [`S1-01-T15`](./tasks/S1-01-T15.md) | Seed starter lookup tables (`V1_01`) | `database` | [`S1-01-T9`](./tasks/S1-01-T9.md) | Database & Data | @Ankomah959Julius | Todo |
| [`S1-01-T16`](./tasks/S1-01-T16.md) | Verify staging health check & API connection | `testing` | [`S1-01-T5`](./tasks/S1-01-T5.md), [`S1-01-T7`](./tasks/S1-01-T7.md), [`S1-01-T11`](./tasks/S1-01-T11.md), [`S1-01-T15`](./tasks/S1-01-T15.md) | QA & Testing | @badu12-png | Todo |
