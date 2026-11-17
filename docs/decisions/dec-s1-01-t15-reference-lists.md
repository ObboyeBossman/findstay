# DEC-S1-01 (cont.) — T15 reference lists: agreed values, fixed ids, starter flags

Continues the decision set from
[`dec-s1-01-t9-database.md`](./dec-s1-01-t9-database.md) (`DEC-S1-01/J`–`/K`).
Recorded by @ObboyeBossman (Product Owner) during S1-01-T15, 2026-11-17,
while loading the starter reference values the whole system reads
(issue #24). Each entry: the decision, the reason, what it changes, and
the follow-up.

---

## DEC-S1-01/L — `V1_13` carries the agreed values; every list gets fixed ids and dark flags

**Decision.** T15's seeds are one additive migration, `V1_13__seed_reference_lists.sql`,
containing exactly: the **seven accommodation types** confirmed at the Sprint 1
kickoff (2026-11-16, decision 5 — `Single Room`, `Double Room`, `Studio`, `Suite`,
`1-Bedroom Apartment`, `2-Bedroom Apartment`, `Entire House`, all active); the
**four billing periods** the ERD §3.4 pins (`NIGHTLY` active — the only Sprint 1
period; `MONTHLY`, `PER_TERM`, `ACADEMIC_YEAR` seeded inactive for the long-stay
and hostel sprints; no weekly, ever); and **three platform settings**
(`privacy.policy_version = 1`, plus the two kickoff-confirmed feature flags
`flag.auth.sms_otp = false` and `flag.notifications.sms = false`). Every row uses a
**fixed UUIDv7 id** (timestamp `2026-11-17T00:00:00Z`, sequential suffixes — the
same style as the V1_04 role seeds) and `ON CONFLICT DO NOTHING`, and the settings
carry a fixed `updated_at`, so every environment — local, CI, staging — starts
byte-identical and re-runs never duplicate. Future value changes are new
migrations (`V1_14+`) or admin edits at runtime (S1-16), never edits to `V1_13`.

**Reason.** The kickoff resolved the open values BR-03/T15 had left undecided
(DEC-S1-01/J deliberately seeded nothing then); the ERD and `V1_03`'s header
already fixed the billing-period codes and the no-weekly rule; and the two flags
record decisions the team actually made (decision 1: email verification links in
R1, SMS OTP only after sender-ID approval; decision 4: In-App + Email channels
live first, P-08 SMS adapter later). Off-by-default is sprint rule C7 for feature
flags. `privacy.policy_version` must exist before S1-11 captures consent records
that reference a version. Fixed ids keep the rows referenceable (the `listing`
tables point at `accommodation_type_id`/`billing_period_id`) and keep seed
verification exact in T12's throwaway-database tests.

**What it changes.** The story wording "the first numbered script (V1_01)" is, in
final numbering, **`V1_13`** — the same shift `DEC-S1-01/J` already recorded for
the structure scripts (`V1_03`), because project setup owns `V1_01`/`V1_02`
applied history. `api/README.md` documents the seeded values and moves the next
free version to `V1_14`.

**Deferred follow-ups.** (1) The bootstrap admin account (kickoff decision 6)
is **not** a seed row: it is provisioned from environment variables through
Supabase Auth at S1-16, because SQL cannot create a Supabase Auth user;
`updated_by_user_id` stays `NULL` until then. (2) Amenity and area values
(S1-13), the permission catalogue (S1-06) and notification templates (S1-10)
remain with their owning tasks, per `DEC-S1-01/J`. (3) If the SMS sender-ID is
approved, switching the two flags on is an S1-10/S1-16 runtime change, not a
migration.
