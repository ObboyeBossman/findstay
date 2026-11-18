# Sprint 2 UI Concept — Simplified Progressive-Disclosure Browse Filters

- **Status:** Saved concept for Sprint 2 planning/refinement (not yet implemented; does not alter approved Sprint 1/2 requirements until confirmed at Sprint 2 Planning).
- **Related Sprint & Stories:** [Sprint 2 Plan](./sprint-02.md) — `S2-01` (Search, location & campus search) and `S2-02` (Filters: type, price, amenities, capacity, dates, rating).
- **Saved Visual & Mockup Files:**
  - PNG reference: [`sprint-02-filter-progressive-disclosure.png`](../../design/assets/sprint-02-filter-progressive-disclosure.png)
  - Interactive/HTML mockup: [`sprint-02-filter-progressive-disclosure.html`](../../design/assets/sprint-02-filter-progressive-disclosure.html)
- **Visual System:** Uses the approved [FindStay Color Palette](../../design/color-palette.md) (`Olive #55624A`, `Terracotta #BC6746`, `Sand #DCCB91`, `Ivory #F7F3EA`, `Earth #3E2F26`).

---

## 1. Design Rationale

To avoid overwhelming guests on the browse screen, filtering uses **progressive disclosure** across **three states and one persistent chip row** directly below the search bar (`Search stays, places, or features`).

### State 1 — Default (no panel open)
- Four quiet pill chips sit beneath the search bar: **Location**, **Type**, **Price**, and **All filters**.
- No overlay or drawer is open by default; listing cards appear immediately underneath with nothing blocking discovery.

### State 2 — Single chip tapped (in-place micro-panel)
- Tapping a single category chip opens a focused, non-scrolling in-place micro-panel for **only that category** (no full-screen takeover).
- **Price** uses **4 named tiers** instead of a numeric range slider because GHS amounts mean different things across cities (e.g., Accra vs. Takoradi) and named tiers communicate expectations faster:
  - **Budget:** `₵0 – ₵200`
  - **Mid-range:** `₵200 – ₵500`
  - **Premium:** `₵500 – ₵1,000`
  - **Luxury:** `₵1,000+`
- One tap selects the option; a single Terracotta CTA (**`Show X stays`**) confirms.
- Once active, the chip switches to the Olive active state showing the selected value (e.g., `₵200–500`) and gains a quick-clear `×` dismiss control.

### State 3 — "All filters" tapped (compact bottom sheet)
- Opens a bottom sheet with a drag handle, **`Filters`** header, **`Clear all`** reset link, and three compact sections:
  1. **Location** — 2-column pill grid of major Ghana destinations (`Accra`, `Kumasi`, `Takoradi`, `Cape Coast`, `Tamale`, `Ho`).
  2. **Accommodation type** — wrap-around pill row (`Apartment`, `Guesthouse`, `Hotel`, `Budget hotel`, `Serviced`).
  3. **Price per night** — 4 quick-select pills (`Under ₵200`, `₵200–500`, `₵500–1k`, `₵1k+`).
- The **`All`** chip displays a Terracotta count badge of active filters (e.g., `3`), and the bottom sheet confirms with **`Show X stays`**.

### Intentionally excluded from the initial browse chip bar
- **No rating stars**, **no amenity checkboxes**, and **no date picker** on this lightweight browse layer — proposed to live deeper in the search/booking flow so the initial discovery surface stays fast and uncluttered.

---

## 2. Sprint 2 Alignment Notes (To Confirm at Sprint 2 Planning)

Before building `S2-01` and `S2-02` in Sprint 2, reconcile these points against the approved baseline:

1. **Requirement coverage (`S2-02` / `FR-25`–`FR-30`, `UR-G03`):**
   - `S2-02` currently requires filtering by accommodation type (`FR-25`), price range (`FR-26`), amenities/facilities (`FR-27`), guest capacity (`FR-28`), stay dates/availability (`FR-29`), and ratings where available (`FR-30`), and [`SCR-23`](../../design/wireframes/SCR-23-Search-Accommodation-Filters.png) currently shows those controls.
   - **Decision needed at Sprint 2 D1:** Confirm whether this simplified 3-filter chip pattern replaces the initial browse controls (`SCR-22` / `SCR-24`) while keeping dates, guest capacity, amenities, and ratings either in a `"More filters"` / secondary view on `SCR-23` or deferred/re-scoped via change control.
2. **Accommodation type taxonomy (`DEC-S1-01/L`):**
   - [`dec-s1-01-t15-reference-lists.md`](../../decisions/dec-s1-01-t15-reference-lists.md) seeds 7 active unit types (`Single Room`, `Double Room`, `Studio`, `Suite`, `1-Bedroom Apartment`, `2-Bedroom Apartment`, `Entire House`).
   - **Decision needed:** Map the UI labels (`Apartment`, `Guesthouse`, `Hotel`, `Budget hotel`, `Serviced`) to property categories vs. unit accommodation types in the database/API.
3. **Currency & API contract (`BR-04`):**
   - Named price tiers (`₵0–200`, `₵200–500`, `₵500–1,000`, `₵1,000+`) should map cleanly to integer GHS pesewa min/max query parameters on `GET /api/v1/properties/search` (e.g., `0`–`20000`, `20000`–`50000`, `50000`–`100000`, `100000+`).
