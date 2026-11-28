# Admin Activity Log Viewer & Filter Controls Spec (`S1-08-T1`)

- **Story:** `S1-08` (Permanent Activity Log)
- **Screen:** `SCR-21C` (Admin Activity Log Viewer)
- **Route:** `/admin/audit` (guarded by `ADMIN` role + `admin.audit.read`)

---

## 1. Layout & Controls
- **Read-Only Immutability Banner:** Clearly states that every entry is permanent and append-only (`findstay_app` holds `INSERT` and `SELECT` privileges only — no edit or delete controls exist in the UI or API).
- **Filter Bar:**
  - **Action filter:** Dropdown / text input for canonical dot-delimited audit actions (e.g. `listing.approved`, `listing.rejected`, `listing.suspended`, `listing.restored`, `verification.approved`, `user.suspended`, `user.restored`, `availability.block_created`, `setting.updated`).
  - **Entity Type filter:** Dropdown (`USER`, `ORGANIZATION`, `VERIFICATION_CASE`, `PROPERTY`, `UNIT`, `AVAILABILITY_BLOCK`, `PLATFORM_SETTING`).
  - **Actor ID filter:** UUID search input to trace all actions by a specific administrator or user.
  - **Date Range (`From` / `To`):** Ghana calendar dates (`Africa/Accra`) converted to inclusive UTC instants (`from`, `to`) when querying `GET /api/v1/admin/audit-logs`.
  - **Apply & Clear Filters** buttons (`min-h-touch`).

## 2. Activity Log Display (Mobile Cards + Desktop Table)
- **Newest-first ordering** (`created_at DESC`) with pagination (`Previous` / `Next`, showing `offset + 1`–`offset + items.length` of `total`).
- Each row/card displays:
  - **Timestamp (Ghana Time):** UTC timestamp formatted cleanly in `Africa/Accra` (`GMT`).
  - **Actor:** Resolved full name (from `identity`) + short UUID reference.
  - **Action Badge:** Categorised pill with icon + text (`NFR-07`, never colour-alone).
  - **Entity:** `entityType` + `entityId`.
  - **Reason & Metadata:** Extracted `reason` / `notes` plus expandable JSON details for forensic review (`BR-11`, `BRL-19`, `NFR-66`).
