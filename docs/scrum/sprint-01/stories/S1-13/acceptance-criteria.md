# S1-13: Acceptance Criteria

- **Story:** [S1-13: Create Properties, Rooms & Prices](./README.md)
- **Who this helps:** Verified property owners creating and managing hotels, guesthouses, and apartments in Takoradi
- **Priority:** Must have | **Track:** Track B | **Days:** D4–D8
- **Summary:** Let verified owners create, edit, and pause property listings with individual rooms, photos, nightly GHS prices, amenities, and house rules.
- **Screens involved:** Owner Listings List (/owner/listings), Property & Units Editor (/owner/listings/:id/edit), Listing Preview
- **Database tables:** catalog.property, unit, amenity, listing, rate_plan (integer pesewas), area (Takoradi areas)
- **System actions:** Property/unit/listing CRUD, verified-owner gate, submit validation, pause/resume, CatalogQuery seam

## What Proves This Story Is Finished

1. Only verified owners can create, edit, and pause listings with units, photos, nightly GHS prices, amenities, and house rules.
2. Incomplete listings (missing photos, price, capacity, Takoradi area, or rules) are blocked from submission.

## Linked Requirements

- **Business:** [`BR-02`](../../../../requirements/business/business-requirements.md), [`BR-03`](../../../../requirements/business/business-requirements.md), [`BRL-06`](../../../../requirements/business/business-requirements.md)
- **Functional:** [`FR-11`](../../../../requirements/functional/functional-requirements.md), [`FR-12`](../../../../requirements/functional/functional-requirements.md), [`FR-13`](../../../../requirements/functional/functional-requirements.md), [`FR-14`](../../../../requirements/functional/functional-requirements.md), [`FR-15`](../../../../requirements/functional/functional-requirements.md), [`FR-16`](../../../../requirements/functional/functional-requirements.md), [`FR-17`](../../../../requirements/functional/functional-requirements.md), [`FR-22`](../../../../requirements/functional/functional-requirements.md)
