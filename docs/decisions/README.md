# FindStay Decision Log

This directory records decisions that demand review: architecture, contract, and
process decisions made during Sprint delivery that change how the team builds.
Each entry is written in plain English so any teammate or stakeholder can
understand what was decided, why, and what happens next.

- Format: one file per decision set, newest last. IDs are `DEC-<sprint>-<number>`.
- A decision entry records: the decision, the reason, who made it, the date, what
  it changes, and any deferred follow-ups with their trigger.
- Decisions here are referenced from the design documents they affect. They are
  never edited silently — a change to a recorded decision gets a new entry.

| ID | Title | Date | Recorded by | Artifact |
| :--- | :--- | :--- | :--- | :--- |
| `DEC-S1-01` | Backend contracts: account provisioning, module list, OpenAPI pipeline | 2026-11-17 | @ObboyeBossman (Product Owner) during S1-01-T6 | [dec-s1-01-t6-backend-contracts.md](./dec-s1-01-t6-backend-contracts.md) |
| `DEC-S1-01` (cont.) | T8 ERD: consent home, schema naming, six added tables, media link model | 2026-11-17 | @ObboyeBossman (Product Owner) during S1-01-T8 | [dec-s1-01-t8-erd.md](./dec-s1-01-t8-erd.md) |
| `DEC-S1-01` (cont.) | T9 database: final script numbering, seed scope, the `findstay_app` role | 2026-11-17 | @ObboyeBossman (Product Owner) during S1-01-T9 | [dec-s1-01-t9-database.md](./dec-s1-01-t9-database.md) |
| `DEC-S1-01` (cont.) | T15 reference lists: agreed values, fixed ids, starter flags | 2026-11-17 | @ObboyeBossman (Product Owner) during S1-01-T15 | [dec-s1-01-t15-reference-lists.md](./dec-s1-01-t15-reference-lists.md) |
