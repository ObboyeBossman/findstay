# GitHub CLI operations for FindStay delivery (PRs, branches & CI)

> **Board migration note (2026-11-28):** FindStay moved its live Scrum/Kanban execution board from GitHub Project 5 & GitHub Issues to **Trello**. Use [Trello board operations](trello-ops.md) for all story/task board reads and writes. Do **not** create new GitHub Issues or mutate Project 5 for sprint tasks.

Use `gh` for code-delivery verification: pull requests, branches, merges, and GitHub Actions CI runs on `ObboyeBossman/findstay`.

## Verify repository and authentication

```bash
gh auth status
gh repo view --json nameWithOwner,url,defaultBranchRef
```

Never print tokens or environment secrets.

## Inspect pull requests, branches, and CI checks

```bash
gh pr list --state all --limit 50 --json number,title,state,baseRefName,headRefName,mergedAt,url
gh pr view <number> --json number,title,state,baseRefName,headRefName,mergeable,statusCheckRollup,body
gh pr checks <number>
gh run list --branch dev --limit 10 --json databaseId,status,conclusion,headSha,displayTitle
```

When verifying whether a Trello task card is truly Done, confirm that its code PR targets `dev` (never `main` directly), passed CI (`web — typecheck & build` and `api — tests, @Req & module boundaries`), and is merged into `dev`.

## Historical GitHub Issues / Project 5 (read-only archive)

Legacy Sprint 1 issues (`#1`–`#87`) and GitHub Project 5 remain read-only historical context for work completed prior to 2026-11-28 (`S1-01`–`S1-06`, `S1-07`, `S1-11-T1`, `S1-12-T3`, `S1-16-T1`). Do not create new sprint task issues on GitHub; link GitHub PR URLs directly on the corresponding Trello cards instead.
