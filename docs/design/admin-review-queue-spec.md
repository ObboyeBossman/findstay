# Admin Approval Queue & Detailed Review Screen Spec (`S1-15-T1`)

- **Story:** `S1-15` (Admin Review & Listing Approval)
- **Screens:** `SCR-16` (Admin Approval Queue), `SCR-17` (Detailed Verification & Listing Review)
- **Routes:** `/admin/reviews` (and `/admin/approvals` alias, guarded by `ADMIN` role + `admin.review.read`)

---

## 1. Queue View (`SCR-16`)
- **Status Tabs:** `Pending` (`PENDING` verification cases + `PENDING_REVIEW` listings), `Published & Suspended` (active/paused/suspended listings for moderation), and `All / Decided`.
- **Type Filter:** `All`, `Owner Verifications`, `Property Listings`.
- **Queue Cards:** Show item kind badge (`Verification` / `Listing`), organisation name, property or case title, status pill with icon + text (`NFR-07`), and last-updated timestamp in Ghana time (`Africa/Accra`).

## 2. Detailed Review Inspector (`SCR-17`)
- **Verification Case Detail:** Displays organisation name, masked Ghana Card number (`GHA-******789-5`, never raw plaintext), all 3 private verification documents with 5-minute expiring secure preview links (`GET /api/v1/media/{assetId}/signed-url`), and per-document rejection checkboxes when requesting corrections.
- **Listing Submission Detail:** Displays property details, Takoradi area, address, description, house rules, photo gallery, individual units with exact GHS nightly rates, and previous review decisions.

## 3. Decision & Moderation Controls
- **Pending Review Actions (`admin.review.decide`):**
  - `Approve` (publishes listing to `ACTIVE` or marks owner `APPROVED`)
  - `Request Corrections` (requires written reason + at least one correction item or rejected document type)
  - `Reject` (requires written reason)
- **Live / Suspended Listing Moderation (`admin.listing.moderate`):**
  - `Suspend Listing` (on `ACTIVE` / `PAUSED`, requires written reason; removes listing from public reads)
  - `Restore Listing` (on `SUSPENDED`, requires written reason; restores listing to `ACTIVE`)
- Every decision writes an immutable entry via `AuditRecorder`, records `review_decision` / `listing_status_history`, and sends an owner alert via `NotificationSender`.
