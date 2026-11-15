# Assignment and member-profile management

Use this for ownership recommendations, assignment changes, capacity, performance history, or profile updates.

## Evidence to inspect

Discover the current roster rather than assuming a fixed team:

1. `docs/team/team.md` for names, roles, and GitHub handles.
2. `docs/team/roles.md` for role responsibilities and task tags.
3. `docs/team/members/*/README.md` for primary track, assigned work, ahead work, completed impact, and activity history.
4. Live GitHub Project/issues for current WIP and ownership.
5. PRs, reviews, tests, designs, decisions, or other linked evidence for demonstrated experience.
6. A sprint capacity record, when present. If availability is absent or stale, mark it **Unknown** and ask for it before committing sprint capacity.

Never use commit counts alone as productivity, quality, seriousness, or suitability. Do not infer availability, competence, or personal characteristics from silence or missing data.

## Matching model

Recommend an owner using, in order:

1. Required role/skill and the work's affected layer.
2. Confirmed availability and current WIP.
3. Relevant primary track and demonstrated evidence.
4. Dependencies and continuity with related work.
5. Review independence and knowledge-sharing needs.
6. Fair distribution and learning opportunity without putting Critical work at unsupported risk.

For each recommendation, state evidence, current load, important uncertainty, and a backup/reviewer. A role match without capacity evidence is a candidate, not a final assignment.

Explain the recommendation in plain language. A member and an outside reviewer should be able to see why the person was selected, what they are accountable for, who supports or reviews them, and what information is still missing. Avoid unexplained role codes, internal shorthand, or technical labels.

Avoid assigning a single person both implementation and sole acceptance/review. Critical or cross-layer work should name coordination ownership plus the contributing roles; do not hide a multi-role task under one assignee.

## Capacity and WIP

- Use person-days or another team-approved capacity measure for the active sprint; subtract classes, leave, standing duties, integration/review reserve, and defect reserve.
- Count active GitHub tasks, blocked work that still needs attention, and review duties.
- Prefer finishing active work before starting more. Do not “balance” work by reassigning a nearly complete task without a clear handoff benefit.
- If capacity data is missing, produce a provisional recommendation and list the exact availability question needed.

## Profile maintenance

After an authorised board assignment or status change, update the matching member profile only with verified facts:

- **Assigned Stories & Backlog:** active/queued issue ID, concise task, sprint, live status, and evidence/issue link.
- **What Is Ahead:** confirmed upcoming work, not speculative backlog possibilities.
- **Impact & Completed Work:** accepted outcomes with evidence, not activity alone.
- **Activity Log:** dated assignment, handoff, completion, or material scope/status change with its source.

Preserve existing history. When ownership changes, record the handoff and reason in both the issue and affected profiles. Never erase a former assignment to make the current table look clean.

Profile entries must describe the result or responsibility, not merely “worked on X.” Expand technical shorthand sufficiently for another team member or stakeholder to understand the contribution.

## Assignment output

Use this shape:

| Work | Criticality | Proposed owner | Reviewer/support | Capacity/WIP | Evidence | Uncertainty |
| --- | --- | --- | --- | --- | --- | --- |

Then list conflicts, prerequisite decisions, and any profile/board changes required. Distinguish **proposed** from **applied**.
