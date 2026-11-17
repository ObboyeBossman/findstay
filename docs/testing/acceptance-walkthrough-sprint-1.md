# Sprint 1 Acceptance Walkthrough (UAT Checklist)

**Story:** [S1-01](../scrum/sprint-01/stories/S1-01/README.md) → all Sprint 1 stories → Release `R1`
**Task:** [S1-01-T13](../scrum/sprint-01/stories/S1-01/tasks/S1-01-T13.md) (issue #22)
**Companion:** [Regression plan R1](./regression-plan-r1.md) — what must *keep* passing after every change.
**Written in advance, exactly as the task demands:** a reviewer executes this document click by click — no improvising. Everything is phrased as *do this → expect that*. Where a screen does not exist yet, the step says what its story will deliver, so the same checklist serves both the Day-3 foundation gate and the Day-10 Sprint Review.

**How to run it:** top to bottom, on the staging addresses (Cloudflare `findstay-web-staging.obboyebossman.workers.dev`, Render `findstay-api-staging.onrender.com`), in a fresh browser profile, mobile viewport (360px+) first and then desktop. Tick each box only when the expected result actually happened. Any unticked box = the walkthrough fails, and the sprint review records it.

---

## Part A — The foundation gate (S1-01; run at the Day-3 gate and again at review)

### A1. The server is alive

- [ ] Open `https://findstay-api-staging.onrender.com/actuator/health` → the page answers `{"status":"UP", …}` (not 401, not a timeout; a cold start may take up to ~60 s — wait once).
- [ ] Open `https://findstay-api-staging.onrender.com/actuator/info` → the `build.time` shown is **the day of this walkthrough or later** (proves you are looking at the current build, not an old one).

### A2. The website opens and the three areas route

- [ ] Open the staging website → the guest home renders (FindStay header, "Find trusted stays across Ghana", the three area cards, the feature-folder table).
- [ ] Click **Owner** in the header → the owner area page opens ("/owner"); click **Admin** → the admin area page opens ("/admin").
- [ ] In the address bar, go to `/auth/sign-in` → the Sign in page opens. Then `/nope` → the friendly 404 page opens.
- [ ] Phone-width (360px) and desktop: no horizontal scrolling; header wraps instead of overlapping.

### A3. The website can reach the server (TA-02)

- [ ] Scroll to the footer → the system status shows **API connected (UP)** (green dot). If it says *API unreachable*, stop: the end-to-end skeleton is not alive.
- [ ] (Technical confirmation, optional) Browser devtools → Network → the request to `/api/v1/health` returned `200` with `{"status":"UP"}`.

### A4. The database baseline is real

- [ ] Devtools console on the site: `fetch('/api/v1/health').then(r=>r.json()).then(console.log)` (run against the API URL shown in the network tab) → `status: "UP"` and the `db` component `UP`. A boot that failed Flyway cannot report this.
- [ ] (Reviewer with psql, optional) `SELECT code FROM listing.billing_period WHERE is_active;` → exactly `NIGHTLY`. `SELECT count(*) FROM listing.accommodation_type;` → 7.

### A5. The robot guards the repo

- [ ] Open the repo's **Actions** tab → the latest run on `dev` is green (web build + api tests, api shows "65 tests, 0 skipped" or more as stories add tests).
- [ ] Open any recent pull request → both `web — typecheck & build` and `api — tests, @Req & module boundaries` show green (or red where they protected us) — the marks are on the proposal itself.
- [ ] The `dev` branch rules require both checks (Settings → Branches): a red proposal cannot merge.

### A6. The designs exist and are reviewed

- [ ] `docs/design/`: the design tokens + color palette, the user flows, the backend architecture map + OpenAPI contract, and the ERD are all present, and their story-map rows point at merged PRs.
- [ ] `docs/scrum/sprint-01/decisions/settled-decisions.md` + `docs/decisions/`: the sprint's recorded decisions read without surprises.

---

## Part B — The Sprint Review demo (the 7-step script; run on Day 10)

> Preconditions per step are stated. Where a story has not landed yet, its step reads "blocked on story S1-xx" — the walkthrough still executes every earlier step. Use the test data named here so the checks are repeatable.

### Step 1 — Owner registers and signs in (S1-04, S1-11)

- [ ] On the guest home, click **Sign up**; register `owner1.demo@findstay.test` with a phone number `+233…`.
- [ ] The Act 843 consent notice with the **Privacy Notice link** is shown and must be ticked before continuing; the link opens a readable notice whose version is **1** (matches `privacy.policy_version`).
- [ ] The confirmation email arrives; the link confirms the account; signing in works. **Expect:** a signed-in owner home; the account exists (the reviewer can see the audit entry `account.registered` later in Step 6).
- [ ] Wrong password three times → a clear error, no internal details leaked.

### Step 2 — Company space and staff (S1-07)

- [ ] First sign-in as a new owner creates the company space: name it *Demo Apartments Ltd*, Takoradi.
- [ ] Invite `staff1.demo@findstay.test` as **Property Staff** for one property → the invite appears in the staff's inbox after they register; the permission grant is listed in the company's staff page.
- [ ] **Expect:** the owner and the staff accounts see the company space; a second company's member (from Step 7) does not.

### Step 3 — Verification uploads (S1-12, S1-09)

- [ ] As the owner: upload Ghana Card (JPG/PNG, ≤10 MB), ownership proof, and GTA licence (PDF).
- [ ] **Expect:** each upload shows a progress indicator, lands as *pending review*, and a **preview** of photos renders (WebP on the public side). A >10 MB file is rejected with a clear message.
- [ ] As the admin: the case sits in the verification queue with all three documents viewable.

### Step 4 — Build the listing (S1-13, S1-09, S1-14)

- [ ] Create property *Demo Apartment*: type **1-Bedroom Apartment** (from the seeded list), area in Takoradi, house rules, and up to 10 photos (JPG/PNG/WebP, ≤5 MB each; an 11th is refused).
- [ ] Add two units (Single Room, Double Room) with **Per Night** prices in GH₵ shown with pesewas (e.g. GH₵250.00).
- [ ] Block a date range on the calendar for unit 1. **Expect:** the block renders; re-creating an overlapping block on the same unit is **rejected** (the database's own rule).
- [ ] Save as draft → submit for review. **Expect:** status moves DRAFT → PENDING_REVIEW.

### Step 5 — Approval and go-live (S1-15, S1-10)

- [ ] As the admin: open the review queue, see photos and prices, and **approve**.
- [ ] **Expect:** the listing goes live on the guest search; the owner receives an email alert (In-App inbox also shows it).

### Step 6 — Suspicion and the permanent log (S1-16, S1-08)

- [ ] As the admin: suspend `staff1.demo@…` with a reason → the staff member can no longer sign in; **restore** them → sign-in works again.
- [ ] Open the activity log: filter by actor and by action. **Expect:** register, invite, upload, approve, suspend, restore all present with actor, action, entity, and time; newest first; no edit or delete control exists anywhere in the log.

### Step 7 — Isolation and the backup drill (S1-07, S1-02)

- [ ] Register a second owner with a second company; create one property. **Expect:** their dashboard shows only their own company, property, and documents — nothing of *Demo Apartments Ltd*.
- [ ] The reviewer with database access runs the backup-restore drill documented by S1-02 (dump staging, restore into a scratch database, spot-check the demo listing). **Expect:** the restored copy contains the data above.

---

## Sign-off

| | Result | Notes |
| :--- | :---: | :--- |
| Part A — foundation gate | ☐ pass ☐ fail | |
| Part B — 7-step demo | ☐ pass ☐ fail | steps not yet deliverable: __________ |
| Reviewer / date | | |
| Product Owner acceptance | | |

> A step whose story has not landed is recorded as *not deliverable* — it is neither ticked nor silently skipped. The repeat-test companion is [regression-plan-r1.md](./regression-plan-r1.md).
