# Unit Availability Calendar & Block Controls Spec (`S1-14-T1`)

- **Story:** `S1-14` (Room Availability Calendar)
- **Screen:** `SCR-14C` (Unit Availability Calendar)
- **Routes:** `/owner/calendar` and `/owner/listings/:propertyId/calendar` (guarded by `availability.read`)

---

## 1. Layout & Controls
- **Property & Unit Picker:** Top selector lets owners and authorised property staff choose a property and one of its units (`GET /api/v1/owner/properties` → `GET /api/v1/owner/properties/:id`). When opened from `/owner/listings/:propertyId/calendar`, that property is pre-selected automatically.
- **Month Navigation:** `< Previous Month`, current month label in Ghana time (`Africa/Accra`, `YYYY-MM`), and `Next Month >`, plus a `Today` jump button.
- **Legend (accessible, never colour-alone — `NFR-07`):**
  - **Available:** neutral card tile with open dot/label.
  - **Owner Blocked:** distinct terracotta/sand badge with lock icon (`OWNER_BLOCK`).
  - **Selected Range:** olive outline highlight while picking dates on the calendar.

## 2. Interactive Calendar Grid
- **7-column grid (Mon–Sun)** displaying every Ghana calendar day in the active month with `min-h-touch` tap targets for mobile use (`360px+`).
- Tapping an available day selects the start date; tapping a later day sets the exclusive check-out date (`startDate < endDate`) and pre-fills the **Block Date Range** panel.
- Tapping a blocked day highlights the corresponding block in the **Active Blocks** list so owners/staff can review or unblock it in one tap.

## 3. Block & Unblock Panel
- **Add Owner Block:** `First Blocked Night` (`YYYY-MM-DD`), `Available Again On (Check-out)` (`YYYY-MM-DD`), and Reason (`OWNER_BLOCK — Owner / Maintenance Block`, ready for Sprint 2 `HOLD`/`BOOKING` display).
- **Conflict Handling (`409 CONFLICT`):** If a range overlaps an existing block (including concurrent edits by another staff member), PostgreSQL's `btree_gist` exclusion constraint rejects it and the UI shows a clear inline conflict alert and refreshes the month view.
- **Active Blocks List:** Lists every block overlapping the visible month with formatted `Africa/Accra` date ranges and an `Unblock` button (`DELETE /api/v1/owner/units/:unitId/blocks/:blockId`, guarded by `availability.write`).
