# DEC-S1-01 (cont.) — T9 database: final numbering, seed scope, app role

Continues the decision set from
[`dec-s1-01-t8-erd.md`](./dec-s1-01-t8-erd.md) (`DEC-S1-01/A`–`/I`).
Recorded by @ObboyeBossman (Product Owner) during S1-01-T9, 2026-11-17,
while turning the approved ERD
([`docs/design/erd.md`](../design/erd.md)) into the real Flyway migrations.
Each entry: the decision, the reason, what it changes, and the follow-up.

---

## DEC-S1-01/J — the scripts are `V1_03`–`V1_12`, and T9 seeds only what the ERD pins

**Decision.** T9's migrations are `V1_03`–`V1_12` (ten scripts, in the
ERD §6 order), not the ERD's nominal `V1_01`–`V1_10`: `V1_01` (btree_gist)
and `V1_02` (Modulith `event_publication`) already exist from project setup
and are immutable. Within the scripts, T9 seeds **only the four platform
roles** (`GUEST`, `OWNER`, `STAFF`, `ADMIN`, with fixed UUIDv7 ids); every
other seed value — accommodation types, billing periods, platform settings
(T15), the permission catalogue (S1-06), notification templates (S1-10),
amenities and areas (S1-13) — is left to its owning task's own additive
migration, starting at `V1_13`.

**Reason.** The ERD says "T9 owns the final numbering", and Flyway's
never-edit-an-applied-migration rule forces the offset: `V1_01`/`V1_02`
cannot be rewritten to match the ERD's nominal numbers. On seeds: only the
role rows are both pinned verbatim in approved documents (ERD §3.1) and
structurally load-bearing — `user_account.role_id NOT NULL DEFAULT
<seeded GUEST>` needs the GUEST row's id at DDL time, so fixed UUIDv7
constants (`01a15451-a800-7001-bf00-000000000001`, …`0004`) travel with the
identity script and the two can never drift apart. Every other value list
is explicitly *not agreed yet* — T15's own checklist starts with "agree the
exact starting values with the team", and BR-03 and T15 currently name
different accommodation-type lists — so seeding them now would guarantee
corrective migrations inside the same sprint. Structure now, values when
agreed, each in the file that owns them.

**What it changes.** The staging build is ten new scripts (34 tables, 9
schemas, the btree_gist exclusion, the grants) applied after the two
existing init scripts; S1-01's story AC 4 wording ("Flyway `V1_01` seeds
the starter lookup tables") is satisfied by the *combination* of T9
(`V1_03` creates the tables) and T15 (its `V1_13` seeds them).

**Follow-up.** T15 (#24) takes `V1_13` for accommodation types, billing
periods (NIGHTLY on; MONTHLY, PER_TERM, ACADEMIC_YEAR off; no weekly) and
platform settings incl. `privacy.policy_version`; S1-06, S1-10 and S1-13
seed their catalogues the same way. Story AC wording flagged to the story
owners; not edited here.

## DEC-S1-01/K — the app DB role is a group role, and audit's append-only rule is enforced by grants

**Decision.** `V1_12` (last script — "grants last", ERD §6) creates
`findstay_app`, a **NOLOGIN group role**: full CRUD on the business
schemas, `SELECT`+`INSERT` only on `audit.audit_log`, and
`ALTER DEFAULT PRIVILEGES` so later migrations' tables in the eight CRUD
schemas are granted automatically. The audit schema is deliberately
excluded from the default privileges — future audit-owned tables must be
granted explicitly, the safe direction for an append-only module. The
deployment's login user joins the group once, outside the migrations
(`GRANT findstay_app TO "<render-user>";` — see `api/README.md`).

**Reason.** S1-08 AC 2 requires that audit rows cannot be edited or
deleted *even at the database role level* — that is a grants property, not
a constraints property, and a migration cannot know the deployment's login
name to grant membership itself. A NOLOGIN group role carries the
privilege set independently of who logs in; local dev (connecting as the
owner) is unaffected, staging can adopt it, and T12's throwaway-database
tests can `SET ROLE findstay_app` and prove `UPDATE`/`DELETE` on
`audit_log` is denied (verified in T9's evidence run). Auto-granting
future tables removes the one realistic failure mode (a later migration
forgetting its grants) without weakening audit, which stays opt-in.

**What it changes.** One new role and a grants script; no table, column or
contract change.

**Follow-up.** The deployment step that grants membership is in the
runbook; staging adoption happens with S1-02's hosting work.
