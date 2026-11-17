# DEC-S1-01: Backend contracts — account provisioning, module list, OpenAPI pipeline

- **Recorded:** 2026-11-17, during task `S1-01-T6` (backend map, data-flow & API contracts)
- **Decided by:** @ObboyeBossman (Product Owner, owner of S1-01-T6)
- **Affects:** `api/`, `web/`, `docs/rules/module-boundaries.md`, `api/openapi.yaml`, `docs/design/backend-architecture.md`
- **Status:** Decided. Contracts pending team review (T6 checklist item 5).

---

## DEC-S1-01/A — How a new account reaches our database (provisioning)

**The decision.** When a person finishes signing up in the browser (Supabase confirms
their email or SMS code), the React app itself calls one small API endpoint —
`POST /api/v1/auth/provision` — to create that person's record in our own database.
The call is *idempotent*: if the account already exists, the API simply answers
`200 OK` again instead of creating a duplicate. If the browser tab closes before the
call happens, nothing breaks — the next time the app loads `GET /api/v1/me`, the
account is provisioned on demand.

**What the API does and does not do.** Supabase Auth remains the only system the
browser uses to register, confirm codes, and reset passwords (this follows the
already-settled decision `P-09`). The Spring API never re-implements sign-up,
password reset, or OTP checking. It only: (1) verifies the Supabase login token
(JSON Web Token) on every request, (2) provisions the local account record when
asked, and (3) serves the person's profile, roles, and organisation memberships
through `GET /api/v1/me`.

**Why this and not a server-to-server webhook.** The alternative — Supabase calling
our API through a webhook whenever an account is created — needs three things we do
not have in Sprint 1: a public webhook endpoint, a signing-secret validation layer,
and retry/failure handling. Building those just to avoid one client-side fetch call
is extra work with no Sprint 1 payoff. The chosen approach follows the same
philosophy as the already-settled `P-08` fallback rule: ship the simple working
thing now, harden it later.

### Deferred improvement — do this when due

| ID | Improvement | Trigger | What to add |
| :--- | :--- | :--- | :--- |
| `DEC-S1-01/A-F1` | Server-side account provisioning webhook (replaces the client-side `/provision` call as the primary trigger) | Sprint 3–4, when the domain-event bus and hardening work begin | A Supabase webhook handler in `identity` that provisions accounts server-to-server, with signing-secret validation and retry handling. Additive only: keep `POST /api/v1/auth/provision` working (idempotent) so nothing breaks. This is exactly the kind of additive extension the No-Conflict Contract (`C3`, `C4`) protects. |

---

## DEC-S1-01/B — The ten Sprint 1 modules and the `listing` rename

**The decision, in one line.** Sprint 1 has **ten** backend modules — and the module
that owns properties is named **`listing`**, not `catalog`.

**The rename.** The approved rules file (`docs/rules/module-boundaries.md`) already
said the public read interface lives in `listing.api`. `CatalogQuery` is the *seam
interface name* inside `listing.api` — not the module name. So the Java package
`com.findstay.catalog` was renamed to `com.findstay.listing`, and the matching web
feature folder `web/src/features/catalog` became `web/src/features/listing`. The
rename cost nothing: the folders only contained placeholder files.

**The three modules the rules file missed.** The rules file's Sprint 1 row listed
seven modules; that was a planning-level list that missed three modules the Sprint 1
stories explicitly require. All three are legitimate Sprint 1 modules and stay as
they are:

| Module | Story | Why it must be its own module |
| :--- | :--- | :--- |
| `organization` | `S1-07` | Owns `organization`, `membership`, `membership_permission` — the multi-tenancy aggregate root. `OrgScope` is a *consumer* of this data, not a replacement for it. |
| `audit` | `S1-08` | Owns `audit_log`. Every other module calls its `AuditRecorder` seam — being called by everyone is exactly why it needs its own boundary. |
| `media` | `S1-09` | Owns `media_asset`, `document`. Pre-signed URL issuing and WebP promotion cannot live inside `listing` without coupling listings to Cloudflare R2 — that would break module isolation (`C5`, `C6`). |

**The rules file was patched, not the code.** The Sprint 1 row of
`docs/rules/module-boundaries.md` now reads:
`shared, identity, organization, verification, listing, availability, media, audit, notification, admin`.

**The canonical module list** (this is what T8 builds the ERD against) is published
in [`docs/design/backend-architecture.md`](../design/backend-architecture.md).

**One point deliberately left open for T8.** Two acceptance-criteria documents
(S1-13, S1-15) mention database schemas as `catalog.property` and
`catalog.listing_status_history`. Those are *database schema names*, which are T8's
to settle: T8 decides whether the PostgreSQL schema keeps the name `catalog` or
follows the module name `listing`. Nothing in the code depends on that choice yet.

---

## DEC-S1-01/C — Where the OpenAPI contract lives and how it is produced

**The decision.**

| Question | Answer |
| :--- | :--- |
| Path | `api/openapi.yaml` — one file, never moved (CI scripts hard-code the path) |
| Format | OpenAPI 3.1.0, YAML, single file covering all `/api/v1/*` endpoints |
| Committed? | Yes — on every release tag, so CI can diff against the previous release |
| Long-term source of truth | Generated by the `springdoc-openapi-maven-plugin` from controller annotations during `mvn package`; hand-authoring stops once controllers exist |

**Why one file and not one spec per module.** Spring Modulith's module boundaries
are an *internal* concern; to the outside world the API is one server. One file
means CI runs one diff check instead of many, and a reviewer sees the whole
surface in one place.

**Why `api/` and not `docs/`.** The spec is an artifact of the Spring module, not a
document. The CI diff gate needs `git show <previous-tag>:api/openapi.yaml` to work
unambiguously.

**How T11's CI gate will use it** (recorded here so T11 does not have to re-decide):

```text
mvn springdoc-openapi:generate
git show $PREVIOUS_RELEASE_TAG:api/openapi.yaml > /tmp/previous.yaml
openapi-diff /tmp/previous.yaml api/openapi.yaml --fail-on-incompatible
```

The generated file must be committed on every release tag — if it is not, the diff
gate has nothing to compare against and is useless.

### Transition note (important)

As of this decision, the API modules are empty placeholders — there are no
controllers yet, so there is nothing for the springdoc plugin to generate. The
`api/openapi.yaml` committed with `S1-01-T6` is therefore **hand-authored: it is the
design contract** the frontend and backend teams review and agree (T6 checklist
item 5). The hand-off is:

1. **Now (Sprint 1 design):** `api/openapi.yaml` is the agreed contract, edited by
   people, versioned in Git.
2. **When the first controllers land** (feature stories `S1-03` onward): the
   springdoc plugin is configured (T11 scope), `mvn springdoc-openapi:generate`
   becomes the source of truth, and the file becomes generated output. The
   committed hand-authored contract serves as the baseline the first diff is taken
   against.
3. **From the first release tag (`R1`) on:** only generated versions are committed,
   and the CI gate compares tag to tag.

---

## DEC-S1-01/D — Amendment during review: the in-app inbox endpoints and `notification_delivery`

**What happened.** While PR #39 was in review, the contract was re-checked — this
time against the sprint story task documents, not only against T3's endpoint
appendix. That second pass found two things T3's appendix had missed but the
S1-10 story demands:

1. **In-app inbox endpoints.** Task `S1-10-T5` is titled "Build
   `GET /api/v1/notifications` & mark-as-read endpoints", and the S1-10 acceptance
   criteria name the Notification Bell & Inbox screen with `GET /api/v1/notifications`
   as a system action. Without these endpoints the bell badge and inbox screen
   (`S1-10-T1`/`T6`, `FR-71`) would have nothing to read.
2. **The `notification_delivery` table.** Task `S1-10-T2` creates *four* tables —
   notification, template, preference **and delivery** — and acceptance criterion 2
   ("failed deliveries are logged and retried") depends on the delivery log. The
   canonical module table previously listed only three.

**What changed (additive only).** `api/openapi.yaml` grew three operations —
`GET /api/v1/me/notifications` (returns the page plus an `unreadCount` the bell
badge reads), `POST /api/v1/me/notifications/{id}/read`, and
`POST /api/v1/me/notifications/read-all` — with `Notification` and
`NotificationPage` schemas. The canonical module table now lists
`notification_delivery` under the `notification` module. The backend map gained
the notification outflow edges (inbox reads, transactional email via the
swappable adapter, Supabase's own auth emails) and the admin review-queue edges;
two new diagrams were added — the verification→decision→notification sequence
(§3.4) and the event→template→channel fan-out (§4.7).

**One naming refinement.** S1-10-T5's shorthand path `/api/v1/notifications` was
nested as `/api/v1/me/notifications`, because T3 had already put the preferences
at `/api/v1/me/notifications/preferences` — the caller's own resources live under
`/me`. The story task's intent (list + mark read) is unchanged. This refinement is
on the review agenda (§8, item 9) for the frontend to confirm.

**Scope note.** Delivery in R1 is **polling** (app start + bell open); no
SSE/WebSocket push — a push channel would be a Sprint 3+ additive change, like
the SMS adapter (`P-08`).

---

## DEC-S1-01/E — Second review pass: story-level contract gaps closed

**What happened.** After DEC-S1-01/D, the contract was audited once more — this
time against *every* sprint story's acceptance criteria and task list, not just
T3's flows. That pass found that T3's endpoint appendix is not the complete
picture: several story documents name endpoints and tables T3 never drew. All
gaps below are closed in `api/openapi.yaml` (44 paths / 53 operations) and the
architecture map.

**Endpoints added (all story-level, none in T3 §9).**

| Endpoint | Why it had to exist |
| :--- | :--- |
| `GET /owner/members` · `PATCH /owner/members/{userId}` | S1-07 AC: "An owner can invite staff and **grant or revoke per-property permissions**." SCR-08's staff list and T3's `org.staff_role_updated` audit event had no read or write path at all. |
| `GET /owner/invitations` | SCR-08 shows invitation status ("already invited" check, expiry); T3 listed only the POST. |
| `POST /admin/users` | S1-16-T3 is titled "search, **create**, suspend, restore" and the AC names "user create/suspend/restore APIs". No T3 screen — flagged for UI in the review agenda. |
| `POST /admin/listings/{propertyId}/suspend` + `/restore` | S1-15-T3: "approve/reject/request-corrections/**suspend/restore** with mandatory reason". Admin moderation takedown, distinct from the owner's own pause; new `SUSPENDED` listing status. |

**Flows fixed.**

- **Suspension is immediate (S1-16 AC 2).** JWKS validation alone cannot do
  this — a token stays valid up to an hour. Now specified: `identity` calls
  Supabase's *service-role Admin API* (server-to-server, never from the
  browser) to revoke sessions, and every request re-checks account status
  after JWT validation. The backend map gains this as flow 15.
- **Photo upload lifecycle was broken.** The photo presign returned no id, and
  nothing ever created the photo record. Now: presign creates the photo row and
  returns `photoId`; `PUT …/photos` (reorder + cover) commits it;
  `DELETE …/photos/{photoId}` removes it. No extra confirm call.
- **Search got `sort` and `minPricePesewas`** (SCR-24 sort control; price
  *range*), a `429` on the anonymous surface (NFR-23), and **map coordinates**
  (`latitude`/`longitude`) on every public read — SCR-24 has a map view and no
  output schema exposed location before.
- **`preferredLanguage`** added to `GET/PATCH /me` (S1-05's `user_profile`
  column).
- **Admin-bound notifications made explicit**: verification submitted and
  listing submitted alert the platform admins (in-app + email) — T3's §8
  notification matrix rows the map's trigger list had dropped.
- **Audit taxonomy extended (additive)**: `auth.admin_login` (SCR-17),
  `user.admin_created`, `listing.suspended` / `listing.restored`.

**Canonical table corrections (§1 — what T8 builds from).**

- `identity` owns **five** tables: `user_account`, `user_profile`, `role`,
  `permission`, `role_permission` (S1-04/05/06) — previously two.
- `listing` also owns **`area`** (Takoradi reference data, S1-13-T2).
- **Open point for T8:** S1-11's AC says `identity.consent_record`, while this
  map places `consent_record` in `verification` (where the `/consents`
  endpoints and Act 843 handling live). Recommendation: `verification`; the
  column shape (user_id, policy_version, consented_at, ip_address) is agreed
  either way. Review agenda item 11.
- **Event edge added:** `verification` → `listing` — the Verified Owner badge
  (SCR-24/25) is fed by a `VerificationApproved(orgId)` domain event that
  denormalises `owner_verified` onto published projections. Event, not a query
  dependency; no FK.

**Deliberately NOT decided unilaterally** (review agenda items 10–12): the
amenity/area option-list read path (reference endpoints vs build-time
constants), `consent_record`'s final home, and the search sort default.

---

## Review trail

- Decisions made and recorded during the S1-01-T6 working session (2026-11-17).
- Contracts to be agreed with frontend (@maskkuratahiru-wq), backend
  (@joseibonsu206-gif), and database (@fummey, T8) — see the S1-01-T6 pull request.
- Referenced by: `docs/design/backend-architecture.md`, `api/openapi.yaml`,
  `docs/rules/module-boundaries.md`.
