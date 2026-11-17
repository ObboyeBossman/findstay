# DEC-S1-01 (cont.) — T8 ERD: consent home, schema naming, added tables, media model

Continues the decision set from
[`dec-s1-01-t6-backend-contracts.md`](./dec-s1-01-t6-backend-contracts.md)
(`DEC-S1-01/A`–`/E`). Recorded by @ObboyeBossman (Product Owner) during
S1-01-T8, 2026-11-17, while turning the T6 data flow into the ERD
([`docs/design/erd.md`](../design/erd.md)). Each entry: the decision, the
reason, what it changes, and the follow-up.

---

## DEC-S1-01/F — `consent_record` lives in `verification`, not `identity`

**Decision.** The privacy-consent table is
`verification.consent_record (user_id, policy_version, consented_at,
ip_address)` — exactly the columns S1-11 pinned.

**Reason.** S1-11's acceptance criteria wrote `identity.consent_record`, but the
consent endpoints (`GET /consents/latest`, `POST /consents`) and the Act 843 /
P-12 handling live in the `verification` module. A table stays with the module
that serves it — putting the table in `identity` would make `verification` call
into `identity` for its own primary data. The T6 map recommended `verification`
and left the call to T8; T8 confirms.

**What it changes.** Nothing in the contract (endpoints already sit under
`/consents`). The ERD (§3.3) and the V1_05 migration own the table.

**Follow-up.** S1-11's acceptance-criteria wording should change
`identity.consent_record` → `verification.consent_record` when that story
starts. Flagged to the story owner; not edited here.

## DEC-S1-01/G — one PostgreSQL schema per module, named like the module

**Decision.** The database schema names are `identity`, `organization`,
`verification`, `listing`, `availability`, `media`, `audit`, `notification`,
`admin`. The drafted `catalog.` prefix is dropped.

**Reason.** DEC-S1-01/B renamed the module `catalog` → `listing` before any
code landed, and left the schema-naming call to T8. Naming the schema exactly
like the module keeps one rule everyone can recite ("one module, one schema of
the same name") and removes the last `catalog` reference. Nothing in the code
or the contract depends on `catalog`.

**What it changes.** Table names move from `catalog.property`,
`catalog.listing_status_history` (as written in S1-13/S1-15 acceptance
criteria) to `listing.property`, `listing.listing_status_history` — and every
other table gets its module prefix the same way.

**Follow-up.** S1-13 and S1-15 acceptance-criteria wording updated when those
stories start. Flagged to the story owners; not edited here.

## DEC-S1-01/H — six tables added to the canonical list (28 → 34)

**Decision.** The ERD adds six tables the T6 canonical list did not name:
`organization.invitation`, `organization.invitation_property`,
`listing.accommodation_type`, `listing.billing_period`, `listing.property_amenity`,
`listing.property_photo`.

**Reason, table by table.**
- `invitation` (+ `invitation_property`): the contract has four invitation
  endpoints and an `Invitation` schema (status, expiry, per-property scope),
  but no story names storage, and `membership` cannot hold an invite (the
  invitee has no `user_id` until they accept). The acceptance token is stored
  **hashed**.
- `accommodation_type` + `billing_period`: T15's own task creates them in
  `V1_01` ("shared lookup tables"), and NFR-46 requires adding new
  accommodation types **without code changes** — a CHECK constraint cannot do
  that. Billing periods seed as NIGHTLY on; monthly/per-term/academic-year off;
  no weekly.
- `property_amenity`: the contract exposes `amenities: array<string>` on
  property and S1-13 names an `amenity` table — the junction connects them.
- `property_photo`: photo order and cover are listing-owned data; the bytes
  belong to `media`. The junction holds `position` + `is_cover`; the 10-photo
  cap is enforced at presign.

**What it changes.** The canonical table count T8 builds from is now **34**.
The T6 map §1 carries an additive note pointing here. `invitation_property`
and `membership_permission` mirror each other (pending vs accepted property
scoping).

**Follow-up.** None — additive only.

## DEC-S1-01/I — `media.document` is the single ownership link

**Decision.** Every uploaded object is a `media.media_asset` row (the R2
object registry: bucket, key, size, upload state), and `media.document
(owner_type, owner_id, media_asset_id, storage_key)` is the **only** place a
business object is linked to its files. Business tables (e.g.
`verification_document`, `property_photo`) store **no** asset ids.

**Reason.** S1-09's acceptance criteria name `media.document (owner_type,
owner_id, storage_key)`. Without this decision, verification and listing would
each store their own asset pointers and ownership would have two sources of
truth — exactly what the module-boundary rules forbid. With it, "which files
belong to X" has one answer, and the pre-signed GET flow (admin review, NFR-24)
has one place to look.

**What it changes.** `verification_document` keeps workflow state only
(status, fix note); its files are found via `document`. The photo presign
returns `document.id` as the contract's `photoId` (DEC-S1-01/E lifecycle).
`property_photo.document_id` is the listing side of the same link.

**Follow-up.** None — the contract already matches.
