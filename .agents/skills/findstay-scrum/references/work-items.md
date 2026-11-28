# FindStay work-item contract

Use this when creating or changing stories, tasks, backlog order, or sprint scope.

## Hierarchy and identifiers

- A story is tracked in `docs/scrum/sprint-XX/stories/<STORY-ID>/README.md` and represented as a Trello story card (or label/group) using the repository identifier and title, for example `S1-01: Project Setup & System Design`.
- Executable role/work tasks are Trello task cards. Follow the established repository identifier form `S1-01-T1`, `S1-01-T2`, and so on; do not introduce a competing `.1` convention.
- Use deeper sub-tasks (as Trello checklist items or split cards) only when they provide independent ownership or verification. Avoid checklist-sized card fragmentation.
- Link every task card to its parent story (via story label and/or story card checklist) and attach its GitHub Pull Request URL when implementation starts. Do not create new GitHub Issues for sprint tasks.

## Story readiness contract

Every story must identify:

- user/stakeholder outcome and why it matters;
- linked requirement and decision IDs with Must/Should/Could priority;
- explicit acceptance criteria;
- dependencies, blockers, provider accounts, and required inputs;
- affected UI/API/database/infrastructure/documentation areas;
- security, privacy, tenant-isolation, compatibility, and migration impact;
- verification and evidence expected for acceptance;
- size/capacity fit and a clear owner for coordination.

If one of these is unknown, create a time-boxed refinement, design, research, or decision task. Do not hide uncertainty inside an implementation task.

## Plain-language task standard

Write for two audiences at once: the person doing the work and a non-technical stakeholder checking what was assigned. The outcome and acceptance checks must make sense without reading source code.

- Use a title that names an action and visible result: `S1-04-T2: Show a clear message when sign-in fails`.
- Avoid titles such as `Handle auth`, `Fix backend`, `API work`, or `Improve validation`.
- Explain technical terms immediately: “JSON Web Token (the signed login proof sent to the API).”
- Describe one accountable outcome per task. Split work when two outcomes can be completed, reviewed, or assigned independently.
- State non-goals to prevent two people from interpreting the same task differently.
- Make every acceptance check observable and pass/fail. “Works correctly” is not an acceptance check.
- Put commands, file paths, database details, and implementation suggestions after the plain-language outcome. Do not make a prescribed technical approach mandatory unless an approved architecture decision requires it.

Good acceptance check: “When an inactive user tries to sign in, the page explains that the account is inactive and the API returns HTTP 403; an automated test proves this.”

Ambiguous acceptance check: “Authentication errors are handled properly.”

## Task card description

Use a compact, testable structure:

```markdown
## Outcome
In plain language: what observable result this task produces and why it matters.

## Traceability
- Parent: S1-01
- Requirements/decisions: TA-01, PD-01
- Priority / criticality: Must / High — reason

## Scope
- Included work
- Explicit non-goals

## Acceptance checks
- [ ] Concrete pass/fail result

## Dependencies and inputs
- Predecessors, decisions, designs, accounts, or `None`

## Verification and evidence
- Commands, review artefact, link, screenshot, test, or document expected

## Technical notes (only when needed)
- Necessary implementation constraints, terms, commands, or affected files, explained briefly

## Delivery roles
- Owner: proposed/confirmed person
- Reviewer/support: proposed/confirmed person
```

Do not copy an entire requirements document into the Trello card. Link to the canonical repository path and quote only what the assignee needs to act correctly.

Before creating or assigning the card, ask whether a reader can understand its purpose, boundary, owner, dependency, completion test, and evidence without guessing. Refine any card that fails this check.

## Change control

When a task needs revision:

1. Identify the trigger: clarified requirement, decision, dependency, defect, estimate/capacity change, or newly discovered implementation constraint.
2. Determine affected requirement IDs, acceptance criteria, dependent stories, assignments, sprint goal, and release contract.
3. Classify the change as clarification, in-sprint replan, backlog change, or accepted-scope change.
4. Update the canonical document first when the product promise changed; update the Trello card/list state second; update member profiles last.
5. Preserve history in Trello card comments, decision/activity logs, or Git rather than silently rewriting completed evidence.

Do not weaken acceptance criteria or the Definition of Done to make progress appear complete. Remove Could items first, then whole Should items, when capacity is insufficient.

## State policy

Expected Trello lists are `Backlog` → `Ready` → `In Progress` → `Review` → `Done`, with `Blocked` as an explicit exception list. Discover the live list names on the board before writing; do not assume they remain unchanged.

- Backlog → Ready only after the readiness contract passes.
- Ready → In Progress only with an owner and available capacity.
- In Progress → Review only when the task's deliverable and self-verification exist.
- Review → Done only after acceptance and required evidence.
- Any active state → Blocked when progress requires an unavailable decision/input/dependency; record the blocker owner and next review date.
