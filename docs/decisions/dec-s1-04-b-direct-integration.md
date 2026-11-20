# DEC-S1-04/B — Direct Provider Integration: No Boundary Abstraction

**Recorded:** 2026-11-19 by @ObboyeBossman (Product Owner), immediately after [DEC-S1-04/A](./dec-s1-04-a-vendor-boundaries.md) merged (PR #55), ahead of S1-04 (issue #4).
**Supersedes:** [DEC-S1-04/A](./dec-s1-04-a-vendor-boundaries.md) in full. With A withdrawn, the *id model* of [DEC-S1-01/A](./dec-s1-01-t6-backend-contracts.md) stands again: `user_account.id` **is** the Supabase Auth uid, provision copies it in, and `P-09` (Supabase is the only auth system in R1) is unchanged.

## The decision, in one line

No abstraction in front of a provider we are not replacing: every vendor (Supabase Auth, R2, email, PostgreSQL) is integrated directly, and if a provider is ever actually replaced, that migration is done in place then — as its own epic, with its own decision.

## Why now

DEC-S1-04/A landed as insurance against a future provider swap. The Product Owner withdrew it the moment it merged: the insurance premium is permanent complexity — a mapping table on the login hot path, a two-insert provision recipe, a per-request uid-to-id resolution, and promised interface seams (`StorageClient`, `EmailSender`) plus a module-boundary checker — all before a single account exists and with no second provider on any roadmap. The project is complex enough; its complexity budget goes to product stories, not to portability it may never need.

The revert is nearly free **today**, while the database holds zero accounts and no story code touches the boundary; the day S1-04 lands with real users, it becomes a migration project. Withdrawing it now is the last cheap day — the same urgency argument A made for splitting, pointing the other way.

## What is reverted or cancelled

| From DEC-S1-04/A | Action under B |
| :--- | :--- |
| A.1 identity split — `identity.auth_identity` (`V1_14`), app-UUIDv7 `user_account.id`, dual-insert provision, per-request uid resolution | **Reverted.** `V1_15` drops the table; DEC-S1-01/A's id model and provision flow stand again, unchanged |
| A.2 storage — one `StorageClient` interface in `media`, the T11 checker confining the S3 SDK | **Cancelled.** When S1-09 lands, `media` calls the S3 SDK directly; no wrapper, no checker |
| A.4 email — one `EmailSender` interface in `notification` | **Cancelled.** When S1-10 lands, `notification` calls the chosen vendor directly |

## What stands (unchanged by this decision)

- **A.3 portable PostgreSQL** — standard engine features only, migrations proven on vanilla PostgreSQL in CI on every PR. Not an abstraction: it costs nothing and adds no seam.
- **A.5 the shared job runner** — `shared.BackgroundJobs` remains the only job runner; no vendor job SDKs.
- **DEC-S1-01/A's provision contract** — browser → `POST /api/v1/auth/provision` (idempotent), `GET /api/v1/me` lazy fallback; the JWT's `sub` *is* the `user_account.id`.
- **The Modulith rules** (`C5`/`C6`) — cross-module references stay logical uuid columns, never FKs. Orthogonal to this decision.
- **The ERD's UUIDv7 rule** for every table except `user_account.id` — which is again its one documented exception.

## The rule going forward

1. Direct integration stays direct. No interface, wrapper, or mapping table in front of a single concrete provider.
2. An abstraction is built only when a second real implementation exists today — never as insurance against a hypothetical future swap.
3. A provider migration, if one is ever actually needed, is one deliberate epic: its own decision, its own data plan, revert the old direct integration and write the new one in place.

## What this decision changes in the artifacts

- **New:** `V1_15__drop_auth_identity.sql` (this revert; `user_account.id` needs no DDL change — `V1_14` altered the rule of who generates the value, never the column) and the DEC-S1-04/B proof in `ThrowawayDatabaseHarnessTest` (both migrations present in every fresh database, the boundary table gone).
- **Updated:** ERD back to 34 tables — §1 id rule (the `user_account.id` exception returns), §2 inventory, §3.1 diagram and note, §4 constraints row removed, §6 numbering note; `api/README.md` migration table and next free version `V1_16`; this file added to the decision log index.
- **Removed:** the seven DEC-S1-04/A boundary proofs from `ThrowawayDatabaseHarnessTest`.
- **Untouched on purpose:** `V1_14` (applied migrations are never edited), `dec-s1-04-a-vendor-boundaries.md` and `dec-s1-01-t6-backend-contracts.md` (recorded decisions are never edited — this file is the supersession record).

## Deferred follow-ups

| ID | Follow-up | Trigger | What to add |
| :--- | :--- | :--- | :--- |
| `DEC-S1-04/B-F1` | Shared throwaway-DB container across integration test classes (carried over from `DEC-S1-04/A-F4` — a test-harness concern, not an abstraction) | The first story that adds a second integration test class (S1-04) | Start the container once per test run (singleton pattern) so the cached Spring context keeps its pool; keep the skip-without-Docker semantics |
| `DEC-S1-04/B-F2` | A provider migration, if ever proposed | A story that actually requires replacing a provider | A new decision + epic: revert the old direct integration, write the new one in place, migrate the data — the exact work this decision deliberately defers |

DEC-S1-04/A's other follow-ups die with it: `A-F1`/`A-F2` (account linking, second provider) existed only because of the boundary table; `A-F3` (provisioning webhook) is already recorded where it belongs, as `DEC-S1-01/A-F1`.
