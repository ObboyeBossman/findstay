# DEC-S1-04/A — Vendor Boundaries: Portable at the Seams, Committed Everywhere Else

**Recorded:** 2026-11-19 by @ObboyeBossman (Product Owner), ahead of S1-04 (issue #4).
**Supersedes:** the *id model* of [DEC-S1-01/A](./dec-s1-01-t6-backend-contracts.md) — `user_account.id` is no longer the Supabase Auth user id. DEC-S1-01/A's *provisioning flow* (browser → `POST /api/v1/auth/provision`, idempotent, `GET /api/v1/me` lazy fallback) and `P-09` (Supabase is the only auth system in R1) both stand unchanged.

## The decision, in one line

Build for portability **at the boundaries that are expensive to retrofit** (identity ids, storage access), and commit fully to the vendors everywhere else — no abstraction layers for their own sake, no multi-provider frameworks.

## Why now

S1-04 (Sign-Up, Confirmation & Sign-In) is the next feature story and the first code that would write a Supabase user id into business data. Today the database holds **zero accounts** and no login flows exist, so the identity split is one additive migration and a provision-flow recipe. The day after S1-04 lands with real users, the same change becomes a migration project: rewriting login/logout/reset/invitation flows, reworking JWT validation, mapping existing users, handling live sessions and account recovery, and potentially asking every user to reset their password. **The risk is user disruption, not development time — and the cost curve turns vertical at S1-04's merge.**

## A.1 Identity — FindStay user ids ≠ auth-provider ids (the safeguard that was missing)

Checked against `dev` on 2026-11-19: `user_account.id` **was** the Supabase Auth uid (DEC-S1-01/A, ERD §1, `V1_04`) — exactly the coupling this decision removes.

**From now on:**

- `identity.user_account.id` is an **application-generated UUIDv7** (via the existing `IdGenerator`), exactly like every other table id. The ERD's single exception to the UUIDv7 rule is gone — this is a simplification, not an abstraction.
- **`identity.auth_identity`** (new, `V1_14`) is the only place a provider's own user id is ever stored: one row per external credential, `(provider, provider_user_id) UNIQUE → user_account_id`. `provider` is a closed `CHECK` set (`'SUPABASE'` today); adding a provider is a deliberate migration.
- **The provision recipe for S1-04** (mechanical, no decisions left to make):
  1. verify the Supabase JWT as today (`sub` = the provider uid, `email` claim available);
  2. `INSERT … user_account (id = IdGenerator.newId(), email, …)` and `INSERT … auth_identity (provider='SUPABASE', provider_user_id = sub, user_account_id = …)` in **one transaction**;
  3. idempotency: on `auth_identity_provider_key` conflict (`23505`) or `user_account_email_key` conflict, select the existing account and answer `200 OK` — same contract as DEC-S1-01/A;
  4. per request, the JWT filter resolves `sub → user_account_id` through `auth_identity` (single indexed lookup, cacheable);
  5. `auth.login_success` audit events and every other module's `user_id` columns carry **FindStay's** id from the first row ever written.
- **What does not change:** every other table already stores `user_id` as a plain logical uuid reference (the Modulith no-cross-module-FK rule) — they now carry FindStay ids by definition, with zero DDL change. Roles, memberships, verification records, consents and audit history survive any future provider swap untouched.
- **What a provider swap looks like after this:** new `provider` value + new rows in `auth_identity` (or a second credential linked to the same `user_account`) — no business-table migration, no password resets forced by our schema.

## A.2 Storage — one interface, S3-compatible, keys not URLs

Checked against `dev`: already mostly right. `media.media_asset` stores `bucket + storage_key` (never full URLs), business tables store no asset ids, and R2 is reached through the AWS S3 SDK (`software.amazon.awssdk:s3`) with env-var config — S3-compatible, not R2-specific.

**The rule for S1-09:** all SDK access lives behind **one `StorageClient` interface in `media`'s public api package**; no other module imports `software.amazon.awssdk` (the T11 module-boundary checker enforces this). Stay inside the S3-compatible subset — no R2-only features. The media module's code is still empty, so this costs nothing today and is free to build right when S1-09 lands.

## A.3 PostgreSQL — standard engine, portable migrations, continuously proven

Checked against `dev`: already satisfied and **tested on every PR** — T12's suite rebuilds the whole database from the real Flyway scripts on a vanilla throwaway PostgreSQL 16 container in CI.

**The rule:** standard PostgreSQL only. No Supabase-only database features — no console-defined RLS policies, no `supabase_functions`, extensions limited to portable ones (`btree_gist` is fine). Changing hosting providers then means pointing `SPRING_DATASOURCE_URL` elsewhere and running the same migrations.

## A.4 Email — one seam, chosen when S1-10 lands

No email code exists yet (S1-10 is the notification story). **The rule:** one `EmailSender` interface in `notification`'s public api package; the vendor sits behind it with env-var config, exactly like the storage rule. Recorded now so the S1-10 owner does not have to decide.

## A.5 Background jobs — the shared runner, no vendor SDKs

Checked against `dev`: `shared.BackgroundJobs` (Spring `TaskScheduler`, virtual threads, idempotent by contract) is already the only job runner. **The rule:** jobs keep going through it; no vendor-specific job SDKs. If a story ever needs a durable queue, prefer a PostgreSQL-backed one (portable with the database we already run) and record it as a new decision.

## The cost table (what deferring each area would have cost)

| Area | State on `dev` before this decision | Cost of deferring | Action |
| :--- | :--- | :--- | :--- |
| Identity | Coupled: `user_account.id` = Supabase uid | **High and rising** — full migration project after S1-04 + real users | Split now (`V1_14`, this decision) |
| Storage | 80% right by design (keys, S3 SDK); code not started | Low — one interface when S1-09 lands | Rule recorded (A.2) |
| PostgreSQL | Standard + CI-proven on every PR | Low | Rule recorded (A.3) |
| Email | No code yet | Low if behind one seam | Rule recorded (A.4) |
| Jobs | Vendor-neutral runner already in place | Low | Rule recorded (A.5) |

## What this decision changes in the artifacts

- **New:** `V1_14__auth_identity.sql` (this PR) and the DEC-S1-04/A proof methods in `ThrowawayDatabaseHarnessTest` (proves the DDL, the uniqueness, the FK, the closed provider set and the `findstay_app` grants on a real database — all database-level proofs live in that one class until F4 below lands).
- **Updated:** ERD §1 (id rule — exception removed), §3.1 (`auth_identity` in the diagram), §4 (constraints row), §6 (numbering note), table count 34 → 35; `api/README.md` migration table + next free version → `V1_15`; this file added to the decision log index.
- **Untouched on purpose:** `V1_04` and `dec-s1-01-t6-backend-contracts.md` — applied migrations and recorded decisions are never edited; this entry is the supersession record.

## Deferred follow-ups — do these when due

| ID | Follow-up | Trigger | What to add |
| :--- | :--- | :--- | :--- |
| `DEC-S1-04/A-F1` | Account linking policy (two credentials, one email: link or reject) | S1-04 review, if product wants social sign-in later | A `provider_email` column on `auth_identity` + a linking flow; additive |
| `DEC-S1-04/A-F2` | Second auth provider (e.g. SMS OTP or Google) | A story that requires it | New `provider` CHECK value + rows; no business-table change — the point of this decision |
| `DEC-S1-04/A-F3` | Server-side provisioning webhook | Sprint 3–4 hardening (as DEC-S1-01/A-F1 already records) | The webhook handler provisions through the same recipe; the id model is unaffected |
| `DEC-S1-04/A-F4` | Shared throwaway-DB container across multiple integration test classes | The first story that adds a second integration test class (S1-04) | Start the container once per test run (singleton pattern) so the cached Spring context keeps its pool; keep the skip-without-Docker semantics. Found the hard way: the container lifecycle is per class, the context cache is per run |
