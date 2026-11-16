---
name: git-file-checkpoint
description: Explicit-only Git workflow that commits and pushes each changed file before another file is edited. Do not use for ordinary local development or routine commits.
---

# Git File Checkpoint

The root `AGENTS.md` remains authoritative. This skill changes checkpoint mechanics only; it does not authorize architecture changes, unrelated files, deployment, history rewriting, or production work.

Use this skill only after the user explicitly invokes `$git-file-checkpoint`, asks to enable per-file checkpoints, or requests that every file change be committed and pushed separately. It establishes a strict remote-backup workflow for the current task. A local commit is not a checkpoint until its push succeeds.

## Activate safely

Before editing:

1. Inspect status, the current branch, upstream state, remotes, and unpushed commits without exposing credential-bearing URLs.
2. Require a clean working tree. If pre-existing changes exist, stop and ask whether to preserve them outside this workflow or checkpoint each path separately. Never include them silently.
3. Use the existing `dev` branch. This mode commits directly to `dev` by design. Never push directly to `main`, `staging`, or any other protected or release branch unless the user explicitly names and authorizes it. Moving work from `dev` into `staging` or `main` happens only via PR or when the user explicitly asks.
4. Confirm that the branch tracks its remote and is neither ahead nor diverged. Do not pull, merge, rebase, create a branch, or rewrite history without direction.
5. Perform a non-mutating authentication check. If it fails, request credentials through the platform's secure mechanism and do not begin edits.
6. Ensure the commit identity (`git config user.name` and `git config user.email`) is set to `ObboyeBossman` and `obboyebossman@gmail.com` before committing.
7. State the active branch and that strict file-checkpoint mode is enabled.

## Mandatory per-file cycle

For exactly one logical path at a time (a rename's old and new paths count together):

1. Verify the working tree is clean and the branch has no unpushed commits.
2. Name the one path to change, then edit only that path.
3. Do not run formatters, generators, installs, builds, or tests that may modify other files.
4. Inspect status and the diff. Stop if any other path changed.
5. Stage only the intended path with an explicit pathspec; never use `git add .`, `git add -A`, or `git commit -a`.
6. Review the staged file list and diff for secrets, generated artifacts, and unrelated edits. Run `git diff --cached --check`.
7. Commit with a precise Conventional Commit message.
8. Push that commit immediately to the selected upstream branch.
9. Verify the branch is no longer ahead and the tree is clean. Report the commit ID before touching another file.

There is no next-file step until the push and verification succeed.

## Credential and safety boundaries

- Never print, log, inspect, embed, or persist tokens in files inside the repository (including gitignored ones), output, remote URLs, configuration, or commit messages.
- Never stage `.env` files, credentials, secrets, build output (`dist/`), or unrelated user work.
- Never force-push, rewrite history, or resolve divergence automatically.
- If a hook, authentication check, or push fails, stop all project edits and resolve only that failure before retrying the same push.
- If a command unexpectedly changes another file, stop before staging and ask how to proceed.

## Completion

The mode ends when the task is complete or the user explicitly disables it. Confirm the branch and remote, the last pushed commit, that no commits remain unpushed, and any work deliberately left unfinished. Do not merge or delete branches without a separate explicit request.
