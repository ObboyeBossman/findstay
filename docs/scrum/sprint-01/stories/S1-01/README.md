# S1-01: Project Setup & System Design

**Details:** Priority: Must | Track A | Days 1–3  
**Acceptance Criteria:** See [acceptance-criteria.md](./acceptance-criteria.md)

## Done When
- All Sprint 1 system designs (UI/UX wireframes, backend architecture & OpenAPI, database ERD) are documented and reviewed.
- The empty starter app builds, passes tests (including module-boundary checks), and deploys to staging from CI.

## What this story is about

Before any feature is built, the team designs the system on paper and sets the project up. By the end of this story every important part of FindStay exists as a drawing — the user flow diagrams (screen-to-screen paths), the screen sketches (wireframes), the backend map with its data-flow diagram, and the database diagram (ERD) — and the shared look (colors, fonts, spacing) is decided in one swappable style file. On the setup side, an empty but working website, server and database are live on staging, with an automatic checker that tests and publishes every change.

Nobody owns this story alone. Its 16 tasks are shared completely across the nine eligible team members. **Each person delivers one or two concrete things; when the deliverables are brought together, the system is fully designed and the project fully set up.** That is the aim — not a pile of abstract chores.

## Tasks

| Task ID | Task | Tag | Depends On | Role | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| [`S1-01-T1`](./tasks/S1-01-T1.md) | Confirm the Sprint 1 work list — what we build first, agreed by everyone | `requirements` | — | Product & Requirements | @kwesipaa643-sys | Done |
| [`S1-01-T2`](./tasks/S1-01-T2.md) | Pick FindStay's colors, fonts & spacing (one style file, swappable) | `ui-ux` | [`S1-01-T1`](./tasks/S1-01-T1.md) | UI/UX Design | @maskkuratahiru-wq | Done |
| [`S1-01-T3`](./tasks/S1-01-T3.md) | Draw the user flow diagrams — every screen-to-screen path | `ui-ux` | [`S1-01-T1`](./tasks/S1-01-T1.md) | UI/UX Design | @dztrb | Done |
| [`S1-01-T4`](./tasks/S1-01-T4.md) | Sketch every Sprint 1 screen (wireframes, phone-first) | `ui-ux` | [`S1-01-T2`](./tasks/S1-01-T2.md), [`S1-01-T3`](./tasks/S1-01-T3.md) | UI/UX Design | @surnuel | Done |
| [`S1-01-T5`](./tasks/S1-01-T5.md) | Build the empty starter website — guest, owner & admin areas wired | `frontend` | [`S1-01-T2`](./tasks/S1-01-T2.md), [`S1-01-T10`](./tasks/S1-01-T10.md) | Frontend Development | @maskkuratahiru-wq | Done |
| [`S1-01-T6`](./tasks/S1-01-T6.md) | Draw the backend map & data-flow diagram, agree the API contracts | `backend` | [`S1-01-T1`](./tasks/S1-01-T1.md) | Backend Development | @ObboyeBossman | Done |
| [`S1-01-T7`](./tasks/S1-01-T7.md) | Set up the empty server app with the shared pieces ready | `backend` | [`S1-01-T6`](./tasks/S1-01-T6.md), [`S1-01-T10`](./tasks/S1-01-T10.md) | Backend Development | @joseibonsu206-gif | Done |
| [`S1-01-T8`](./tasks/S1-01-T8.md) | Draw the database diagram (ERD) — every table & how it connects | `database` | [`S1-01-T1`](./tasks/S1-01-T1.md), [`S1-01-T6`](./tasks/S1-01-T6.md) | Database & Data | @fummey | Done |
| [`S1-01-T9`](./tasks/S1-01-T9.md) | Build the real database from the ERD with numbered scripts | `database` | [`S1-01-T8`](./tasks/S1-01-T8.md) | Database & Data | @fummey | Done |
| [`S1-01-T10`](./tasks/S1-01-T10.md) | Set up the code repo, branch rules, secrets & staging site | `devops` | — | Architecture, Cloud & Security | @ObboyeBossman | Done |
| [`S1-01-T11`](./tasks/S1-01-T11.md) | Build the automatic checker — tests & publishes every change | `devops` | [`S1-01-T5`](./tasks/S1-01-T5.md), [`S1-01-T7`](./tasks/S1-01-T7.md), [`S1-01-T10`](./tasks/S1-01-T10.md) | Architecture, Cloud & Security | @ObboyeBossman | Done |
| [`S1-01-T12`](./tasks/S1-01-T12.md) | Set up tests that run on a real throwaway database | `testing` | [`S1-01-T7`](./tasks/S1-01-T7.md), [`S1-01-T9`](./tasks/S1-01-T9.md) | QA & Testing | @badu12-png | Done |
| [`S1-01-T13`](./tasks/S1-01-T13.md) | Write the acceptance walkthrough & repeat-test plan | `testing` | [`S1-01-T1`](./tasks/S1-01-T1.md) | QA & Testing | @fummey | Done |
| [`S1-01-T14`](./tasks/S1-01-T14.md) | Run the kickoff — hand out tasks, set the checkpoints | `lead-scrum` | — | Kickoff Facilitator | @dztrb | Done |
| [`S1-01-T15`](./tasks/S1-01-T15.md) | Fill the starter reference lists (room types, billing periods, settings) | `database` | [`S1-01-T9`](./tasks/S1-01-T9.md) | Database & Data | @Ankomah959Julius | Done |
| [`S1-01-T16`](./tasks/S1-01-T16.md) | Prove staging is alive — server healthy, website reaches the server | `testing` | [`S1-01-T5`](./tasks/S1-01-T5.md), [`S1-01-T7`](./tasks/S1-01-T7.md), [`S1-01-T11`](./tasks/S1-01-T11.md), [`S1-01-T15`](./tasks/S1-01-T15.md) | QA & Testing | @badu12-png | Done |

## Who is doing what

| Teammate | GitHub | Tasks | What they will have at the end |
| :--- | :--- | :--- | :--- |
| Bright Afedi | @kwesipaa643-sys | T1 | The agreed Sprint 1 work list — everyone starts from the same page |
| Mashkura Tahiru | @maskkuratahiru-wq | T2, T5 | The style file (colors/fonts/spacing) and the empty starter website |
| Anthony Maclean | @dztrb | T3, T14 | The user flow diagrams (screen-to-screen paths) and a started sprint with tasks handed out |
| Bossman Abraham N. O. | @ObboyeBossman | T6, T10, T11 | The backend map & data-flow diagram with API agreements, the protected code home, and the automatic checker/publisher |
| Joseph Osei-Bonsu | @joseibonsu206-gif | T7 | The empty server app with the shared pieces (money, dates, errors) ready |
| Solomon Fummey | @fummey | T8, T9, T13 | The database diagram (ERD), the real staging database built from it, and the acceptance walkthrough & repeat-test plan |
| Emmanuel Rockson | @surnuel | T4 | The screen sketches (wireframes) of every Sprint 1 screen, phone-first with desktop variant |
| Sampson Badu | @badu12-png | T12, T16 | Tests that run on a real throwaway database, and the proof that staging is alive end to end |
| Okyere Ankomah Julius | @Ankomah959Julius | T15 | The starter reference lists (room types, billing periods, settings) loaded identically everywhere |

> Task-level changes are recorded in each member's profile activity log. David, Seidu and Theresa are not assigned Sprint 1 tasks for now (invitation/poll pending).

## The aim of each task — what you will have at the end

Every task ends in a concrete thing you can point at. Open your task file for the full explanation and checklist.

- **[T1](./tasks/S1-01-T1.md)** — the agreed Sprint 1 work list, plus open decisions with proposed answers.
- **[T2](./tasks/S1-01-T2.md)** — the one style file of colors, fonts and spacing that every screen copies from; swap a color once, the whole app updates.
- **[T3](./tasks/S1-01-T3.md)** — user flow diagrams: one drawing per journey, every screen and every arrow, including error and empty paths.
- **[T4](./tasks/S1-01-T4.md)** — a grey sketch (wireframe) of every Sprint 1 screen, phone-first with desktop variant.
- **[T5](./tasks/S1-01-T5.md)** — the empty starter website: guest, owner and admin areas each open their own pages.
- **[T6](./tasks/S1-01-T6.md)** — the backend map & data-flow diagram plus the API agreements (what each part accepts and returns).
- **[T7](./tasks/S1-01-T7.md)** — the empty server app with money-in-pesewas, UTC/Ghana dates, standard errors, IDs and background jobs built in and tested.
- **[T8](./tasks/S1-01-T8.md)** — the database diagram (ERD): every table, its columns, and how tables connect — reviewed and agreed.
- **[T9](./tasks/S1-01-T9.md)** — the real staging database, created only by numbered scripts that match the ERD exactly.
- **[T10](./tasks/S1-01-T10.md)** — the protected code repo with safe secrets, and the live staging site.
- **[T11](./tasks/S1-01-T11.md)** — the automatic checker: every change built, tested and published to staging with a green/red mark.
- **[T12](./tasks/S1-01-T12.md)** — tests that each get a fresh, real throwaway database, all labelled with the requirement they prove.
- **[T13](./tasks/S1-01-T13.md)** — the acceptance walkthrough checklist and the repeat-test list, agreed with the Product Owner.
- **[T14](./tasks/S1-01-T14.md)** — the sprint started: tasks handed out, decisions confirmed, Day 2 / Day 3 checkpoints recorded.
- **[T15](./tasks/S1-01-T15.md)** — the starter reference lists (accommodation types, billing periods, platform settings) loaded identically everywhere.
- **[T16](./tasks/S1-01-T16.md)** — evidence that staging is healthy and the website really talks to the server.
