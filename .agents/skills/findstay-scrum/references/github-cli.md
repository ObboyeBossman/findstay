# GitHub CLI operations for FindStay delivery

Use this whenever reading or mutating GitHub issues or the FindStay Delivery Project. Commands are capability-aware because GitHub CLI syntax evolves.

## Resolve live configuration

Current expected defaults are repository `ObboyeBossman/findstay` and user Project `5` owned by `ObboyeBossman`. Verify them every session instead of hardcoding returned node or field IDs:

```bash
gh auth status
gh repo view --json nameWithOwner,url,defaultBranchRef
gh project view 5 --owner ObboyeBossman --format json
gh project field-list 5 --owner ObboyeBossman --format json
gh project item-list 5 --owner ObboyeBossman --limit 200 --format json
```

Required token scopes normally include `repo` and `project`. Never print tokens or environment secrets. If the expected project is missing or ownership changed, discover it with `gh project list --owner <owner> --format json` and report the mismatch before writing.

Project field IDs and single-select option IDs are mutable. Resolve them from `field-list` immediately before ID-based writes. Expected status names currently include Backlog, Ready, In Progress, Review, Done, and Blocked; live names win.

## Read before write

Before creating or changing work:

```bash
gh issue list --state all --limit 200 --json number,title,state,assignees,labels,url
gh issue view <number> --json number,title,state,body,assignees,labels,parent,subIssues,subIssuesSummary,url
gh project item-list 5 --owner ObboyeBossman --limit 200 --format json
```

Check for an existing story/task identifier and matching issue before creation. Treat duplicate IDs as a conflict to resolve, not a reason to create another issue.

## Parent story and sub-issues

Create the parent story first. Prefer `--body-file` over shell-interpolated multiline bodies.

If `gh issue create --help` lists `--parent`, create a sub-issue directly:

```bash
gh issue create --repo <owner>/<repo> --title '<TASK-ID>: <title>' --body-file <reviewed-body-file> --parent <parent-number>
```

If the installed CLI lacks `--parent`, create the issue normally, fetch its database ID, then attach it through the official REST endpoint:

```bash
gh issue create --repo <owner>/<repo> --title '<TASK-ID>: <title>' --body-file <reviewed-body-file>
gh api repos/<owner>/<repo>/issues/<sub-number> --jq '.id'
gh api --method POST repos/<owner>/<repo>/issues/<parent-number>/sub_issues -F sub_issue_id=<database-id>
```

Verify with:

```bash
gh issue view <parent-number> --json parent,subIssues,subIssuesSummary
```

Do not rely on a checklist link as a substitute for the native parent/sub-issue relationship.

## Add and update Project items

Add both story and task issues to the Project:

```bash
gh project item-add 5 --owner ObboyeBossman --url <issue-url> --format json
```

Some newer CLI versions support editing by project number, issue URL, field name, and value. Detect support from `gh project item-edit --help`; when available, prefer the name-based form.

For older versions, resolve the Project ID, item ID, field ID, and option ID from `project view`, `item-list`, and `field-list`, then use:

```bash
gh project item-edit --id <item-id> --project-id <project-id> --field-id <status-field-id> --single-select-option-id <option-id>
```

Set assignees on the issue itself:

```bash
gh issue edit <number> --repo <owner>/<repo> --add-assignee <login>
```

After every write, re-read the issue and relevant Project item. Do not report success from a zero exit code alone.

## Views and hierarchy

The desired Project presentation is:

- Kanban view using the live Status field and a sprint/story filter.
- Table view grouped by **Parent issue**, with **Sub-issues progress**, assignees, and status visible.
- Story-specific filters use `parent-issue:"<OWNER>/<REPO>#<ISSUE_NUMBER>"`.

The installed `gh project` command may not expose view-layout configuration. Do not fake success: verify views through an available API or browser, or provide the exact manual UI step as a remaining action. Altering views or Project fields requires an explicit request.

## Sync and safety

- `npm run sync:project` refreshes repository evidence from the board; inspect `scripts/sync-project.mjs` before relying on its schema and review the resulting diff.
- Prefer idempotent operations: look up by stable story/task ID, then create only if absent.
- Rate-limit bulk creation and stop on the first unexpected response, duplicate, permission error, or source conflict.
- Never close, delete, archive, or reassign active work as part of a generic sync.
- For more than 10 writes, present the full change set and obtain confirmation first.
