# FindStay — Three-Way Delivery Sync Plan (Trello ↔ Docs ↔ Showcase)

**Status:** Planned for future implementation (updated 2026-11-28 after migrating from GitHub Project 5 to Trello)  
**Applies to:** Trello Delivery Board (`TRELLO_BOARD_ID`), `docs/` (`scrum/`, `team/`, `evidence/`), `scripts/`, and `showcase/`

---

## Goal

Keep task statuses, assignees, story progress percentages, and evidence automatically synced across all three places where the team works:

1. **Trello Delivery Board** (live execution board; replaces retired GitHub Project 5 & GitHub Issues for sprint tasks)
2. **Repository Docs** (`docs/scrum/sprint-01/stories/`, `docs/team/members/`, `docs/evidence/project/`)
3. **Showcase Web App** (`showcase/` — personal task tracker & sprint progress site)

GitHub remains the home for source code, branches, pull requests, and CI checks; PR URLs are linked on Trello cards and in `docs/evidence/`.

---

## Core Design Rule: Hub-and-Spoke (No Ping-Pong Loops)

To prevent simultaneous edits from overwriting each other or causing infinite sync loops:

- **Trello** acts as the live execution hub.
- Every automated sync commit uses a bot marker (e.g., `[skip sync]`) so workflows never trigger themselves in a loop.
- No Trello API keys or tokens (`TRELLO_API_KEY`, `TRELLO_TOKEN`) may ever be placed in `showcase/` browser code or committed to Git.

---

## Stage 1: Trello → Docs & Showcase

When a card is created, assigned, moved between lists (`Backlog` / `Ready` / `In Progress` / `Review` / `Done` / `Blocked`), or archived on Trello:

1. **Use & extend `scripts/sync-project.mjs`:**
   - Read live Trello lists, open cards, assignees (`idMembers`), labels, checklists, and card URLs via the Trello REST API using `TRELLO_API_KEY`, `TRELLO_TOKEN`, and `TRELLO_BOARD_ID`.
   - Update `docs/evidence/project/board.json` and `docs/evidence/project/board.md`.
   - Update each story's `README.md` and `tasks/S1-XX-TY.md` (`Assignee`, `Status`, `Evidence`).
   - Update each member's `docs/team/members/<name>/README.md` (`Assigned Stories & Backlog`, `Impact & Completed Work`, `What Is Ahead`, `Activity Log`).
   - Generate `showcase/public/delivery-state.json` for the showcase app.
2. **Scheduled / Webhook Sync (`sync-from-trello.yml`):**
   - Trigger on a schedule, Trello webhook relay (`repository_dispatch`), or manual `workflow_dispatch`.
   - Run `npm run sync:project` with repository secrets (`TRELLO_API_KEY`, `TRELLO_TOKEN`, `TRELLO_BOARD_ID`) and commit changes to `dev` with `[skip sync]`.

---

## Stage 2: Docs → Trello & Showcase

When someone edits task `Assignee`, `Status`, or `Evidence` directly inside `docs/scrum/sprint-01/stories/**/tasks/*.md` and pushes to `dev`:

1. **Create `scripts/sync-docs-to-trello.mjs`:**
   - Parse only the changed task/story Markdown files in the commit.
   - Push updated assignees, target list (`idList`), or checklist/comment updates to the matching Trello card.
   - Regenerate `showcase/public/delivery-state.json`.
2. **GitHub Action (`sync-from-docs.yml`):**
   - Trigger on pushes to `dev` touching `docs/scrum/sprint-01/stories/**`.
   - Skip if the commit message contains `[skip sync]`.

---

## Stage 3: Showcase App (`showcase/`) → Trello & Docs

1. **Phase A — Member Task View (Read-only):**
   - Update `showcase/` to consume `showcase/public/delivery-state.json`.
   - Let any team member filter by name/handle to view their assigned tasks, dependencies, Trello card links, GitHub PR links, and story completion percentages.
2. **Phase B — Interactive Status Updates from Showcase:**
   - Add a lightweight authenticated backend proxy (e.g., a Cloudflare Worker endpoint using server-side `TRELLO_API_KEY` and `TRELLO_TOKEN` secrets).
   - When a team member updates a task's status inside `showcase/`, the Worker moves the **Trello card** to the target list.
   - That Trello update automatically fires **Stage 1**, updating `docs/` and refreshing `showcase/public/delivery-state.json`.

---

## Verification Checklist (When Implemented)

- [ ] Moving a task card to `Done` on Trello updates the cached board (`docs/evidence/project/`), the task file in `docs/`, the member's `README.md`, and `showcase/public/delivery-state.json`.
- [ ] Editing a task status in `docs/` updates Trello and `showcase/` without triggering an infinite loop.
- [ ] Changing status in `showcase/` updates Trello and `docs/` with zero secrets exposed in client-side assets.
