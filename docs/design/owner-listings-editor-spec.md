# Owner Listings List, Property/Units Editor & Preview Spec (`S1-13-T1`)

- **Story:** `S1-13` (Create Properties, Rooms & Prices)
- **Screens:** `SCR-07B` (Owner Listings List), `SCR-11` (Add/Edit Property & Units), `SCR-12` (Photo Management), `SCR-11C` (Listing Preview), `SCR-13` (Submission Status)
- **Routes:** `/owner/listings` and `/owner/listings/:propertyId/edit` (guarded by `listing.read`)

---

## 1. Owner Listings List (`SCR-07B`)
- **Verified-owner banner:** Unverified owners see a clear info banner linking to `/owner/verification` explaining that creating or submitting listings unlocks once verification is approved (`BR-02`).
- **Property cards:** Responsive 1-col mobile / 2-col desktop cards showing cover photo (or neutral sand placeholder), property title, Takoradi area + town, status pill (`DRAFT`, `PENDING_REVIEW`, `CORRECTIONS_REQUESTED`, `ACTIVE`, `PAUSED`, `REJECTED`, `SUSPENDED`), lowest nightly GHS price, and unit count.
- **Quick actions:** `Edit & Manage`, `Pause` (on `ACTIVE`), `Resume` (on `PAUSED`), and `+ Create Property` (enabled for verified owners).

## 2. Property & Units Editor (`SCR-11` + `SCR-12`)
- **Section A — Details & Location:** Property name, accommodation type (7 active R1 types from `/api/v1/catalog/reference`), town (default `Takoradi`), Takoradi pilot area picker (12 seeded areas), street address, optional GPS lat/lng, description, and house rules.
- **Section B — Amenities:** Toggleable chip grid populated from `listing.amenity` (ordered by `display_order`).
- **Section C — Units & Nightly GHS Pricing:** Inline room/unit list where each unit specifies Name, Category, Max Guests (`>= 1`), Quantity (`>= 1`), and Nightly Price in GHS (converted deterministically to integer pesewas before sending to the API; `NIGHTLY` billing period in R1).
- **Section D — Photos (`PhotoUploader`):** Reuses `S1-09-T6` `PhotoUploader` (WebP compression, 5 MB limit, max 10 photos, cover selector, reorder left/right, save order).
- **Section E — Guest Preview (`SCR-11C`) & Readiness Checklist:** Shows live checklist of submission requirements (description, Takoradi area, address, house rules, >= 1 unit with nightly price > 0, >= 1 photo) and blocks submission until every item is green (`BR-03`, `FR-16`).
