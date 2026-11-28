# Trello board operations for FindStay delivery

Use this whenever reading or updating FindStay's live Trello execution board. Trello replaced GitHub Project 5 and GitHub Issues for Sprint task tracking; GitHub remains the source for code, pull requests, and CI checks (`references/github-cli.md`).

## Configuration and authentication

Required environment variables (kept in local `.env` or CI secrets — never committed to Git or printed in logs):

- `TRELLO_API_KEY` — Trello API key
- `TRELLO_TOKEN` — Trello personal token with read/write access to the FindStay board
- `TRELLO_BOARD_ID` — ID or shortLink of the FindStay Delivery Trello board

Check that variables are set without echoing their values:

```bash
node -e "for (const k of ['TRELLO_API_KEY','TRELLO_TOKEN','TRELLO_BOARD_ID']) console.log(k, process.env[k] ? 'SET' : 'MISSING')"
```

If credentials are missing in the current environment, do not guess live board state from cached files under `docs/evidence/project/` — report that the live Trello board is unreachable without credentials and ask the user for the live state or credentials.

## Resolve live board structure (Read before write)

List IDs, label IDs, and member IDs are live Trello values. Resolve them every session rather than hardcoding IDs.

Expected lists (columns) follow the FindStay workflow: `Backlog`, `Ready`, `In Progress`, `Review`, `Done`, and `Blocked` (live list names on the board win).

Use the Trello REST API (`https://api.trello.com/1`) with `key=$TRELLO_API_KEY&token=$TRELLO_TOKEN`:

- **Board metadata:** `GET /1/boards/{boardId}?fields=name,shortUrl,url`
- **Open lists:** `GET /1/boards/{boardId}/lists?filter=open&fields=name,pos`
- **Board members:** `GET /1/boards/{boardId}/members?fields=fullName,username`
- **Labels:** `GET /1/boards/{boardId}/labels?fields=name,color`
- **Open cards (with checklists):** `GET /1/boards/{boardId}/cards?filter=open&fields=name,desc,idList,idMembers,labels,shortUrl,due,dueComplete,pos&checklists=all`

Before creating a card, check all open (and if needed closed) cards for an existing FindStay identifier (`S1-05`, `S1-05-T4`, etc.). Treat duplicate IDs as a conflict to resolve, not a reason to create a duplicate card.

## Modelling stories and tasks on Trello

- **Task cards** use the repository identifier prefix: `S1-07-T3: Auto-create an owner's company space on onboarding and expose GET/PATCH /api/v1/owner/org`.
- **Story cards** use `S1-07: Owner Companies & Staff Access` with a **Tasks** checklist linking each child task card (or tracking task IDs) and a story/sprint label.
- Put the structured plain-language task body (`Outcome`, `Traceability`, `Scope`, `Acceptance checks`, `Dependencies`, `Verification and evidence`, `Delivery roles`) in the card description (`desc`) and acceptance checks in a Trello **Acceptance checks** checklist.
- Attach or link the corresponding GitHub Pull Request URL(s) and canonical `docs/scrum/...` path on the card so code review and board status stay connected.

## Common mutations (when explicitly authorised)

- **Create a card:** `POST /1/cards` with `idList`, `name`, `desc`, `idMembers`, `idLabels`, `pos`.
- **Move a card to another list (status change):** `PUT /1/cards/{cardId}` with `idList=<target-list-id>`.
- **Update assignees:** `PUT /1/cards/{cardId}` with `idMembers=<comma-separated-member-ids>`.
- **Add a comment (status/evidence/handoff note):** `POST /1/cards/{cardId}/actions/comments` with `text=...`.
- **Attach a PR or doc link:** `POST /1/cards/{cardId}/attachments` with `url=...&name=...`.
- **Archive a card (only when explicitly confirmed):** `PUT /1/cards/{cardId}` with `closed=true`.

After every write, re-read the affected card (`GET /1/cards/{cardId}`) to verify the resulting list, assignees, and description. Do not report success from an HTTP 200 alone.

## Sync and safety

- `npm run sync:project` runs [`scripts/sync-project.mjs`](../../../../scripts/sync-project.mjs) to refresh cached snapshots in `docs/evidence/project/board.json` and `docs/evidence/project/board.md` from the live Trello board.
- Never print `TRELLO_API_KEY` or `TRELLO_TOKEN` in terminal logs, PRs, commits, or Markdown files.
- Never archive, delete, or reassign active cards as part of a generic sync.
- Preview and obtain explicit confirmation before more than 10 Trello writes, archiving/deleting cards, replacing an active assignee, or altering board lists/labels.
