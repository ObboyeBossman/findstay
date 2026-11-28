---
name: findstay-story-delivery
description: Plan, implement, or review a FindStay story-sized change with requirement traceability, modular boundaries, and proportionate verification. Use for product features, API changes, schema work, or acceptance-criteria review; not for unrelated repository maintenance.
---

# FindStay story delivery

Use this workflow to turn a named FindStay requirement, story, or feature request into a small, evidence-backed change without loading unrelated project material.

## Establish the change contract

1. Read `AGENTS.md` and the relevant nested guide.
2. Start at `docs/requirements/requirements-analysis.md`; read the matching requirement category and only the applicable sprint story/acceptance criteria. Use `docs/scrum/scrum.md` when sprint allocation or priority is unclear.
3. Read the relevant rule: architecture/security for application work, module boundaries for API work, and no-conflict contract for schema, API, or event work.
4. State the requirement IDs, affected layer/modules, acceptance checks, and compatibility/security implications before expanding scope. Stop for a user decision when a settled decision, an unresolved blocker, or a missing acceptance criterion materially changes the implementation.

## Implement within the seams

- Make the smallest cohesive change that satisfies the selected acceptance criteria.
- For backend work, preserve `api`/`internal` boundaries, enforce organisation scope, and use additive Flyway/API/event evolution.
- For frontend work, use the REST API for business data and Supabase only for Auth; keep authorization in the API and support mobile use.
- Add focused tests for behaviour and failure cases. Keep requirement traceability in the project's established form; do not introduce a pretend test annotation or framework.
- Do not deploy, mutate the Trello board, or claim staging evidence unless the request explicitly authorises it.

## Verify and hand off

Run the narrowest meaningful checks first, then the layer's standard check when feasible: web `npm run typecheck` and `npm run build`; API `mvn test`; showcase `npm run build:showcase`.

Report the requirement/story addressed, files changed, checks run and their results, plus any follow-up that needs a real environment or stakeholder decision. Update documentation only when the change alters a documented promise or produces genuine evidence.
