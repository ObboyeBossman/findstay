# FindStay — Three-Way Delivery Sync Plan (GitHub ↔ Docs ↔ Showcase)

**Status:** Planned for future implementation  
**Applies to:** GitHub Project 5 (`FindStay Delivery`), `docs/` (`scrum/`, `team/`, `evidence/`), `scripts/`, and `showcase/`

---

## Goal

Keep task statuses, assignees, story progress percentages, and evidence automatically synced across all three places where the team works:

1. **GitHub Issues & Project 5** (execution board)
2. **Repository Docs** (`docs/scrum/sprint-01/stories/`, `docs/team/members/`, `docs/evidence/project/`)
3. **Showcase Web App** (`showcase/` — personal task tracker & sprint progress site)

---

## Core Design Rule: Hub-and-Spoke (No Ping-Pong Loops)

To prevent simultaneous edits from overwriting each other or causing infinite GitHub Action loops:

- **GitHub Issues & Project 5** act as the live execution hub.
- Every automated sync commit uses a bot marker (e.g., `[skip sync]`) so workflows never trigger themselves in a loop.
- No GitHub tokens or secrets may ever be placed in `showcase/` browser code.

---

## Stage 1: GitHub → Docs & Showcase

When an issue is assigned, closed, reopened, or moved on Project 5 (or when a PR referencing `Closes #N` merges):

1. **Upgrade `scripts/sync-project.mjs`:**
   - Read live Project 5 items, `Status`, `assignees`, `OPEN`/`CLOSED` issue states, and parent/sub-issue progress.
   - Update `docs/evidence/project/board.json` and `board.md`.
   - Update each story's `README.md` and `tasks/S1-XX-TY.md` (`Assignee`, `Status`, `Evidence`).
   - Update each member's `docs/team/members/<name>/README.md` (`Assigned Stories & Backlog`, `Impact & Completed Work`, `What Is Ahead`, `Activity Log`).
   - Generate `showcase/public/delivery-state.json` for the showcase app.
2. **GitHub Action (`sync-from-github.yml`):**
   - Trigger on `issues`, `projects_v2_item`, `pull_request` (closed/merged), and manual `workflow_dispatch`.
   - Run `npm run sync:project` and commit changes to `dev` with `[skip sync]`.

---

## Stage 2: Docs → GitHub & Showcase

When someone edits task `Assignee`, `Status`, or `Evidence` directly inside `docs/scrum/sprint-01/stories/**/tasks/*.md` and pushes to `dev`:

1. **Create `scripts/sync-docs-to-github.mjs`:**
   - Parse only the changed task/story Markdown files in the commit.
   - Push updated assignees, Project 5 `Status`, or `OPEN`/`CLOSED` state to the matching GitHub Issue / Project 5 item.
   - Regenerate `showcase/public/delivery-state.json`.
2. **GitHub Action (`sync-from-docs.yml`):**
   - Trigger on pushes to `dev` touching `docs/scrum/sprint-01/stories/**`.
   - Skip if the commit message contains `[skip sync]`.

---

## Stage 3: Showcase App (`showcase/`) → GitHub & Docs

1. **Phase A — Member Task View (Read-only):**
   - Update `showcase/` to consume `showcase/public/delivery-state.json` (and optionally public read-only GitHub data).
   - Let any team member filter by name/GitHub handle to view their assigned tasks, dependencies, GitHub issue links, and story completion percentages.
2. **Phase B — Interactive Status Updates from Showcase:**
   - Add a lightweight authenticated backend proxy (e.g., a Cloudflare Worker endpoint using GitHub OAuth and a server-side `GITHUB_TOKEN` secret).
   - When a team member updates a task's status inside `showcase/`, the Worker updates the **GitHub Issue / Project 5 item**.
   - That GitHub update automatically fires **Stage 1**, updating `docs/` and refreshing `showcase/public/delivery-state.json`.

---

## Verification Checklist (When Implemented)

- [ ] Closing a sub-issue on GitHub updates the parent story's completion percentage, the task file in `docs/`, the member's `README.md`, and `showcase/public/delivery-state.json`.
- [ ] Editing a task status in `docs/` updates GitHub Project 5 and `showcase/` without triggering an infinite loop.
- [ ] Changing status in `showcase/` updates GitHub Project 5 and `docs/` with zero secrets exposed in client-side assets.
