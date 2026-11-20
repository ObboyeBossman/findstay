# Solomon Fummey

- **Index Number:** BC/ITD/24/014
- **Preferred Stack:** Backend *(Preference note only to inform task assignment; not a restriction.)*
- **GitHub Handle:** @fummey
- **WhatsApp Name:** `.`
- **Primary Track:** Track A/B (@Req Tests, UAT & Regression R1)

## Assigned Stories & Backlog

| ID | Story / Task | Sprint | Status | Evidence |
| :--- | :--- | :---: | :---: | :--- |
| [`S1-01-T8`](../../../scrum/sprint-01/stories/S1-01/tasks/S1-01-T8.md) | Draw the database diagram (ERD) — every table & how it connects | 1 | Done | [#32](https://github.com/ObboyeBossman/findstay/issues/32) · PR #42 |
| [`S1-01-T9`](../../../scrum/sprint-01/stories/S1-01/tasks/S1-01-T9.md) | Build the real database from the ERD with numbered scripts | 1 | Done | [#33](https://github.com/ObboyeBossman/findstay/issues/33) · PR #43 |
| [`S1-01-T13`](../../../scrum/sprint-01/stories/S1-01/tasks/S1-01-T13.md) | Write the acceptance walkthrough & repeat-test plan | 1 | Done | [#22](https://github.com/ObboyeBossman/findstay/issues/22) · PR #49 |
| [`S1-04-T2`](../../../scrum/sprint-01/stories/S1-04/tasks/S1-04-T2.md) | Create identity.user_profile table & seed core roles | 1 | Done | [`V1_04__identity.sql`](../../../../../api/src/main/resources/db/migration/V1_04__identity.sql) |

## Impact & Completed Work

- **`S1-01-T8`, `T9`, `T13`** — Authored the approved 34-table Sprint 1 ERD, built Flyway migrations `V1_03`–`V1_12`, and published the Sprint 1 acceptance walkthrough and regression plan (Issues #22, #32, #33 closed).
- **`S1-04-T2`** — Built the `identity` schema (`user_account`, `user_profile`, `role`, `permission`, `role_permission`) and seeded the 4 core platform roles (`V1_04__identity.sql`).

## What Is Ahead

_No upcoming items assigned yet._

## Activity Log

- **2026-11-20** — Reconciled completed `S1-01-T8` (#32), `S1-01-T9` (#33), `S1-01-T13` (#22), and `S1-04-T2` (`V1_04__identity.sql`) to Done. Source: verified closed GitHub issues and story task records.

- **2026-11-15** — Assigned story **S1-08 (Permanent activity log)** as their single Sprint 1 starter task, tracked as GitHub issue #8. Source: board assignment by the Scrum steward, approved by the Product Owner (issue created from the approved Sprint 1 plan).
- **2026-11-15** — Assignment basis corrected by the Product Owner: Sprint 1 work is assigned **per task, not per story**. The story-level row recorded earlier today was replaced by the task-level assignments above (`S1-01-T13`) as sub-issues of parent story issue #1; story issue #1 stays on the board as an unassigned tracker. Source: Product Owner instruction via Scrum steward.

**2026-11-16** — Product Owner re-assignment: **S1-01-T8** (database ERD — every table and how tables connect) assigned to Solomon, joining **S1-01-T13** (acceptance walkthrough & repeat-test plan). All 16 S1-01 task documents were also rewritten so each states exactly what to do and what the assignee will have at the end. Source: Product Owner instruction via Scrum steward.

**2026-11-16** — Product Owner re-assignment: **S1-01-T9** (build the real database from the ERD with numbered scripts) assigned to Solomon, joining **S1-01-T8** (the ERD it is built from) and **S1-01-T13** — one owner for the diagram and the database, no handoff. Source: Product Owner instruction via Scrum steward.
