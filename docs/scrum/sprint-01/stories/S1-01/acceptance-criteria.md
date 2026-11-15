# S1-01: Acceptance Criteria

- **Story:** [S1-01: Project Setup & System Design](./README.md)
- **Who this helps:** Development team (so all 12 members can build without conflicts)
- **Priority:** Must have | **Track:** Track A | **Days:** Day 1 – Day 3

## What Proves This Story Is Finished

1. **Starter apps live on staging:** The React frontend, Spring Boot backend, and PostgreSQL database are set up, connected, and deployed to staging with `/actuator/health` green.
2. **System designs reviewed:** The UI/UX design system & `360px`+ wireframes, backend module architecture & OpenAPI contracts, and database ERD are documented and reviewed.
3. **CI & test gates active:** `ApplicationModules.verify()`, Testcontainers, and `@Req("...")` test-tag checks run automatically on every save, and the Sprint 1 UAT/regression plan is ready.
4. **Database & API baseline:** Flyway `V1_01` seeds the starter lookup tables (`accommodation_type`, `billing_period`, `platform_setting`), and the frontend communicates with the backend over `/api/v1/...`.

## Linked Requirements

- **Technical:** [`TA-01`](../../../../requirements/technical/technical-requirements.md), [`TA-02`](../../../../requirements/technical/technical-requirements.md), [`PD-01`](../../../../requirements/technical/technical-requirements.md), [`PD-02`](../../../../requirements/technical/technical-requirements.md), [`PD-07`](../../../../requirements/technical/technical-requirements.md)
- **Non-Functional:** [`NFR-45`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-46`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-47`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-48`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-52`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-54`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-55`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-56`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-57`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-58`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-63`](../../../../requirements/non-functional/non-functional-requirements.md)
