# S1-13: Properties, units, rates and listing lifecycle

**Details:** Pri M, track B, D4 to D8
**Acceptance Criteria:** [See S1-13 in acceptance-criteria.md](../acceptance-criteria/acceptance-criteria.md)

## What Needs to Be Done
- *Done when:* A verified owner creates, edits and pauses a listing with units, photos, rates, amenities and house rules; incomplete listings cannot be submitted.
- *Database:* property, unit, amenity, listing, rate_plan (NIGHTLY only); Takoradi areas and campuses seeded.
- *API:* CRUD with validation; submit-for-approval gate; `CatalogQuery` read API.
- *UI:* Listing editor with photo upload and preview.
- *Tests:* Required-field validation; only verified owners can create; hospitality types supported: hotels, budget hotels, guesthouses, serviced apartments.
