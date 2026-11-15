# FindStay — Ten-Week Delivery Plan

| | |
|---|---|
| **Project** | FindStay Accommodation Discovery and Property Management Platform |
| **Source** | [Requirements Analysis](../requirements/requirements-analysis.md) & [Settled Decisions](./sprint-01/decisions/settled-decisions.md) |
| **Date** | 15 November 2026 |
| **Status** | Approved baseline |

---

## 1. How We Build FindStay
We are building FindStay in **five two-week sprints** (10 weeks total) across two phases:
- **Phase 1 (Sprints 1–3):** Short-stay accommodation marketplace (owner verification, listings, search, booking, Mobile Money & card payments, reviews, and payouts).
- **Phase 2 (Sprints 4–5):** Long-term rentals, maintenance tracking, accounting tools, and student hostels.

Every requirement has one owning sprint and one story, and each sprint builds cleanly on top of the previous one without breaking or rewriting earlier work.

---

## 2. Ten-Week Schedule

| Sprint | Weeks | Phase | Release | What We Deliver | Items | Working Plan |
|:------:|-------|:-----:|:-------:|-----------------|:-----:|--------------|
| **1** | 1–2 | Phase 1 | `R1` | Foundation & Verified Owner Listings | 108 | [sprint-01.md](./sprint-01/sprint-01.md) · [Acceptance Criteria](./sprint-01/acceptance-criteria/acceptance-criteria.md) |
| **2** | 3–4 | Phase 1 | `R2` | Search, Book & Pay (Mobile Money / Card) | 90 | [sprint-02.md](./sprint-02/sprint-02.md) |
| **3** | 5–6 | Phase 1 | `R3` | Operations, Trust & Public Launch | 79 | [sprint-03.md](./sprint-03/sprint-03.md) |
| **4** | 7–8 | Phase 2 | `R4` | Long-Term Rentals & Maintenance | 18 | [sprint-04.md](./sprint-04/sprint-04.md) |
| **5** | 9–10 | Phase 2 | `R5` | Accountants, Student Hostels & Final Release | 9 | [sprint-05.md](./sprint-05/sprint-05.md) |

---

## 3. How Each Two-Week Sprint Works
- **10-Day Rhythm:** Day 1 Sprint Planning → Daily 15-minute check-ins → Day 5 Mid-Sprint Check → Day 8 Feature Freeze → Day 9 Testing & Release → Day 10 Live Demo, Team Review & Next-Sprint Planning.
- **Priorities:** Every story is marked **M** (Must have), **S** (Should have), or **C** (Could have). Unfinished work is switched off and moved back to the backlog rather than holding up the release.
- **Quality Checks:** Before any story is marked Done, it must be reviewed, pass all automated tests, work cleanly on mobile phones (`360px`+), and be demonstrated live. Full checklist in [`scrum-rules.md`](./scrum-rules.md).

---

## 4. Keeping Earlier Work Safe
- **No-Conflict Rules:** New sprints only add new tables, endpoints, and features—they never break or rewrite what is already working. See [`no-conflict-contract.md`](../rules/no-conflict-contract.md).
- **Regression Testing:** Before any new release goes live, all tests from earlier sprints must still pass. See [`module-boundaries.md`](../rules/module-boundaries.md).

---

## 5. Key Decisions
- **Sprint 1 (Already Decided):** See [Settled Decisions](./sprint-01/decisions/settled-decisions.md).
- **Sprint 2 (Needed Day 1):** Booking hold rules, background job hosting, and platform fee/commission rules.
- **Sprint 3 (Needed Day 1):** Owner payout timing, cancellation templates, and speed/uptime targets.
- **Sprint 4 (Needed Day 8):** Student hostel rules, AI support, text-to-speech, and calendar sync.

---

## 6. All 304 Requirements
Every requirement is listed in its dedicated folder:
- [Functional Requirements (`UR-*`, `FR-*` — 180 items)](../requirements/functional/functional-requirements.md)
- [Non-Functional Requirements (`NFR-*` — 66 items)](../requirements/non-functional/non-functional-requirements.md)
- [Business Requirements & Rules (`BR-*`, `BRL-*` — 32 items)](../requirements/business/business-requirements.md)
- [Technical & Delivery Requirements (`TA-*`, `PD-*` — 26 items)](../requirements/technical/technical-requirements.md)
