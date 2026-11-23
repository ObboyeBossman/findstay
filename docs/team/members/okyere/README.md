# Okyere Ankomah Julius

- **Index Number:** BC/ITS/24/164
- **Preferred Stack:** Database *(Preference note only to inform task assignment; not a restriction.)*
- **GitHub Handle:** @Ankomah959Julius
- **WhatsApp Name:** `Mêllø` (`@okyere.julius`)
- **Primary Track:** Track B (Design System, Wireframes & Mobile 360px)

## Assigned Stories & Backlog

| ID | Story / Task | Sprint | Status | Evidence |
| :--- | :--- | :---: | :---: | :--- |
| [`S1-01-T15`](../../../scrum/sprint-01/stories/S1-01/tasks/S1-01-T15.md) | Fill the starter reference lists (room types, billing periods, settings) | 1 | Done | `V1_03`–`V1_12` seeds |
| [`S1-05-T1`](../../../scrum/sprint-01/stories/S1-05/tasks/S1-05-T1.md) | Design forgot-password, reset-password & My Profile screens | 1 | Done | Digital ID card spec & mobile layout |
| [`S1-05-T4`](../../../scrum/sprint-01/stories/S1-05/tasks/S1-05-T4.md) | Build React My Profile page (`SCR-06`, `/profile`) | 1 | Done | [`ProfilePage.tsx`](../../../../../web/src/features/identity/ProfilePage.tsx) |
| [`S1-05-T5`](../../../scrum/sprint-01/stories/S1-05/tasks/S1-05-T5.md) | Test single-use reset links & cross-user profile protection | 1 | Done | [`UserProfileProtectionIntegrationTest.java`](../../../../../api/src/test/java/com/findstay/identity/UserProfileProtectionIntegrationTest.java) |
| [`S1-11-T1`](../../../scrum/sprint-01/stories/S1-11/tasks/S1-11-T1.md) | Draft the Ghana Act 843 privacy notice & consent wording in clear language | 1 | Done | [`privacy-notice-act-843.md`](../../../legal/privacy-notice-act-843.md) |
| [`S1-11-T3`](../../../scrum/sprint-01/stories/S1-11/tasks/S1-11-T3.md) | Build consent recording API & enforce DTO personal-data filtering | 1 | In Progress | Task doc |

## Impact & Completed Work

- **`S1-01-T15`** — Filled starter reference lists across database tables.
- **`S1-05-T1` & `S1-05-T4`** — Designed and built the responsive FindStay My Profile page (`/profile`, `SCR-06`) with digital ID card hero badge, native device photo picker, fallback avatar initials, localStorage persistence, and role-aware switcher. Enforced 100% theme-token compliance (`npm run lint:theme`).
- **`S1-05-T5`** — Created integration test suite (`UserProfileProtectionIntegrationTest.java`) proving cross-user profile isolation (`S1-05-AC2`, `FR-04`), email immutability on `PATCH /api/v1/me`, input validation enforcement, and safe password recovery lookup without metadata leakage.
- **`S1-11-T1`** — Drafted the official Ghana Data Protection Act, 2012 (Act 843) Privacy Notice (`privacy-notice-act-843.md`, Policy Version 1.0) and defined the mandatory registration consent checkbox micro-copy and validation rules.

## What Is Ahead

- **`S1-11-T3`** — Build consent recording API (`POST /api/v1/consent`) & enforce DTO personal-data filtering.

## Activity Log

- **2026-11-23** — Completed `S1-11-T1` by drafting the Ghana Act 843 Privacy Notice (Version 1.0) and specifying the registration consent wording.
- **2026-11-21** — Shipped `S1-05-T4` (`ProfilePage.tsx` under `/profile`) and verified against design tokens and TypeScript compiler. Completed `S1-05-T5` integration tests verifying cross-user isolation and safe recovery lookup.
- **2026-11-16** — No re-assignment: **S1-01-T15** (starter reference lists) confirmed with Okyere. All 16 S1-01 task documents were also rewritten so each states exactly what to do and what the assignee will have at the end. Source: Product Owner instruction via Scrum steward.
- **2026-11-15** — Assignment basis corrected by the Product Owner: Sprint 1 work is assigned **per task, not per story**. The story-level row recorded earlier today was replaced by task-level assignments.
