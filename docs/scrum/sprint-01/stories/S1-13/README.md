# S1-13: Create Properties, Rooms & Prices

**Details:** Priority: Must | Track B | Days 4–8  
**Acceptance Criteria:** See [acceptance-criteria.md](./acceptance-criteria.md)

## Done When
- Only verified owners can create, edit, and pause listings with units, photos, nightly GHS prices, amenities, and house rules.
- Incomplete listings (missing photos, price, capacity, Takoradi area, or rules) are blocked from submission.

## Tasks

| Task ID | Task | Tag | Depends On | Role | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| [`S1-13-T1`](./tasks/S1-13-T1.md) | Design Listings List, Property/Units Editor & Listing Preview | `ui-ux` | [`S1-03-T3`](../S1-03/tasks/S1-03-T3.md) | UI/UX Design | ObboyeBossman | Done |
| [`S1-13-T2`](./tasks/S1-13-T2.md) | Create property, unit, amenity, listing, rate_plan & area tables | `database` | [`S1-07-T2`](../S1-07/tasks/S1-07-T2.md), [`S1-09-T3`](../S1-09/tasks/S1-09-T3.md), [`S1-01-T15`](../S1-01/tasks/S1-01-T15.md) | Database & Data | ObboyeBossman | Done |
| [`S1-13-T3`](./tasks/S1-13-T3.md) | Seed Takoradi areas, landmarks & accommodation types | `database` | [`S1-13-T2`](./tasks/S1-13-T2.md) | Database & Data | `@fummey` | Done |
| [`S1-13-T4`](./tasks/S1-13-T4.md) | Build Property, Unit & Listing CRUD + submit/pause APIs + CatalogQuery | `backend` | [`S1-13-T2`](./tasks/S1-13-T2.md), [`S1-13-T3`](./tasks/S1-13-T3.md), [`S1-07-T5`](../S1-07/tasks/S1-07-T5.md), [`S1-12-T4`](../S1-12/tasks/S1-12-T4.md) | Backend Development | ObboyeBossman | Done |
| [`S1-13-T5`](./tasks/S1-13-T5.md) | Build React Listings List, Editor & Preview | `frontend` | [`S1-13-T1`](./tasks/S1-13-T1.md), [`S1-13-T4`](./tasks/S1-13-T4.md), [`S1-09-T6`](../S1-09/tasks/S1-09-T6.md) | Frontend Development | ObboyeBossman | Done |
| [`S1-13-T6`](./tasks/S1-13-T6.md) | Test verified-owner gate, submission validation & pesewa pricing | `testing` | [`S1-13-T4`](./tasks/S1-13-T4.md), [`S1-13-T5`](./tasks/S1-13-T5.md) | QA & Testing | ObboyeBossman | Done |
