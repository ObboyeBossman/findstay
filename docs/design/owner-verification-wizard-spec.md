# Owner Verification Wizard & Status Tracker Spec (`S1-12-T1`)

- **Story:** `S1-12` (Owner ID & Property Verification)
- **Screens:** `SCR-09` (Owner Verification Upload) and `SCR-10` (Verification Status Tracker)
- **Route:** `/owner/verification` (guarded by `verification.read`; `STAFF` and `GUEST` blocked)

---

## 1. Status Tracker Header (`SCR-10`)
- Always visible at the top of `/owner/verification` showing the current organisation verification status:
  - `NOT_SUBMITTED` — Neutral sand pill + guidance prompt to complete all 3 verification steps.
  - `PENDING` — Info pill (`Under Review`) + submission timestamp (`Africa/Accra`) + masked Ghana Card (`GHA-******789-5`).
  - `PARTIALLY_REJECTED` — Warning pill (`Corrections Requested`) + reviewer notes banner highlighting which document(s) need re-upload.
  - `REJECTED` — Error pill (`Verification Rejected`) + reviewer reason + option to re-submit fresh documents.
  - `APPROVED` — Success pill (`Verified Owner`) + approval date; unlocks publishing listings (`S1-15`).

## 2. Guided 3-Document Onboarding Wizard (`SCR-09`)
- **Identity Number Field:** Ghana Card input (`GHA-XXXXXXXXX-X`) with live format validation and Act 843 privacy disclosure (*"Encrypted with AES-256 at rest and masked in all responses"*).
- **Document Upload Cards (mobile stacked, desktop 3-column grid):**
  1. **Ghana Card (`GHANA_CARD`)** — Front/back clear photo or PDF (max 5 MB).
  2. **Proof of Ownership / Management (`OWNERSHIP_PROOF`)** — Indenture, tenancy management agreement, or title deed (max 5 MB).
  3. **Ghana Tourism Authority Licence (`GTA_LICENCE`)** — Valid GTA registration or licence document (max 5 MB).
- Each card uses `DocumentUploader` (`S1-09-T6`) with direct-to-R2 private upload and 5-minute signed preview link.
- **Resubmission mode:** When `PARTIALLY_REJECTED` or `REJECTED`, approved documents show a green `Approved` lock badge and only rejected documents prompt replacement; clicking **Resubmit for Review** sends the updated assets back to `PENDING`.
