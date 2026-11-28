# Project discovery and reconciliation

Use this when establishing current scope, progress, gaps, or the next useful work.

## Discover before assuming

The repository will grow. Do not use a fixed file inventory as the project model.

1. Confirm the repository and working tree with `git rev-parse --show-toplevel` and `git status --short`. Preserve unrelated or unfinished work.
2. Discover current files with `rg --files`, excluding generated and dependency directories. Find nested `AGENTS.md` files before entering a scope.
3. Read `docs/overview.md`, then use `rg` to locate the requested requirement (`FR-*`, `NFR-*`, `TA-*`, `PD-*`, `BR-*`, `BRL-*`), decision (`J-*`, `P-*`), story (`S*-*`), task (`S*-*-T*`), module, stakeholder, or member.
4. Inspect the relevant requirement category, settled decisions, sprint/story acceptance criteria, and architecture rule only as needed.
5. Inspect live code/tests and evidence before describing implementation progress. Placeholder directories and planned documents are not delivered features.
6. For mutable delivery state, inspect the live Trello board using `references/trello-ops.md` and GitHub PRs/CI using `references/github-cli.md`; cached files under `docs/evidence/project/` are evidence snapshots, not the live board.

Useful discovery commands:

```bash
rg --files docs | sort
rg -n 'S1-04|FR-01|P-09' docs
rg -n '^#|^##' docs/scrum docs/requirements docs/team
find docs/team/members -mindepth 2 -maxdepth 2 -name README.md -print
git log --oneline --decorate -20
```

Replace the example identifiers with the request's identifiers. Prefer direct links among documents over keyword matching when both exist.

## Source ownership

| Question | Primary source | Corroborating source |
| --- | --- | --- |
| What should the product do? | `docs/requirements/` | story acceptance criteria |
| What has been decided? | decision records under `docs/scrum/` | architecture/rules docs |
| What is planned for a sprint? | sprint and story documents | live Trello backlog |
| What is being worked on now? | live Trello board cards/lists | GitHub PRs and branches |
| What is actually implemented? | code, tests, merged PRs | verified evidence |
| Who is suited to a task? | roster, role guide, member profile | current Trello assignments and contribution evidence |
| What is complete? | acceptance evidence and Definition of Done | Trello Done list and merged PR |

## Reconciliation

Classify drift before changing anything:

- **Board stale:** repository/evidence proves a newer state; update the Trello card when authorised.
- **Docs stale:** accepted scope or ownership changed; update the owning document, preserving history.
- **Implementation gap:** planned or Done-labelled work lacks code/tests/evidence; reopen or block instead of manufacturing evidence.
- **Unresolved conflict:** sources disagree about scope or a stakeholder decision; create a decision/refinement action and stop dependent commitment.

End a status review with: delivered, in progress, ready, blocked, unrefined, and undocumented/unknown. Do not treat “not found” as “not required.”
