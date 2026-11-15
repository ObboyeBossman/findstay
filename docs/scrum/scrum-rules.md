# Scrum Delivery, Quality Gates & Priorities

## 1. Before a Story Can Start (Definition of Ready)

A story cannot enter a sprint until all five checks are met:

1. **Clear Requirements:** Every requirement tied to the story (`FR-*`, `NFR-*`, `SEC-*`, `BRL-*`, `CON-*`, `UI-*`) is listed along with its priority (`Must`, `Should`, or `Could`).
2. **Clear Acceptance Criteria:** It is written in plain Given/When/Then steps or clear pass/fail checks so anyone can test it.
3. **No Open Blockers:** Any stakeholder decisions (`J-*`, `P-*`) are already decided, or there is an agreed fallback plan.
4. **Fits in One Sprint:** The work takes 1–3 days and can be finished within the current sprint.
5. **Impact Identified:** We know upfront which database migrations, shared APIs, or module boundaries the story touches.

---

## 2. Before a Story Is Marked Done (Definition of Done)

A story is only **100% Done** when all nine checks pass:

1. **Code Merged:** Built on a feature branch and merged into `main` via a pull request with no compiler or linter warnings.
2. **Automated Tests Pass:** Unit and integration tests cover every acceptance criterion and are tagged with `@Req("...")`.
3. **Module Boundaries Clean:** `ApplicationModules.verify()` passes with no illegal cross-module dependencies.
4. **Database Migration Safe:** The Flyway migration uses the sprint's reserved version range, only adds changes (never breaks old data), and upgrades cleanly.
5. **Security & Privacy Checked:** Permissions, organisation isolation (`OrgScope`), input validation, and audit logging (`AuditRecorder`) are verified.
6. **Works on Mobile & Desktop:** The UI works cleanly on mobile (`360px`+) and desktop screens.
7. **Live on Staging:** Deployed to the live staging environment (Cloudflare Workers + Render + Supabase) with health checks passing.
8. **Regression Tests Pass:** The full regression suite (`R1`..`Rn`) passes in CI.
9. **Demoed & Accepted:** Shown working end-to-end on staging during Sprint Review and accepted by the Product Owner.

---

## 3. Priorities & Unfinished Work

1. **Build in Priority Order (`Must` → `Should` → `Could`):**
   - **Must:** Required for the sprint goal. Built first (Days 1–7).
   - **Should:** Important, but only started after all `Must` stories in the same track are on schedule.
   - **Could:** Built only if `Must` and `Should` items are finished before feature freeze; otherwise hidden behind a feature flag or moved to a later sprint.
2. **Day 2 Infrastructure Check (Sprint 1):** Confirm Supabase storage limits, Render's always-on hosting tier, and SMS sender-ID status. If SMS approval is delayed past Day 2, use email-only OTP as the fallback.
3. **Day 3 Foundation Check (Sprint 1):** If the core setup (Story 01: monorepo, CI, Flyway, staging deploy) is not live by the end of Day 3, everyone pauses feature work to help finish it.
4. **Day 8 Feature Freeze:** No new feature stories start after Day 8. Days 9–10 are for testing, backup/restore drills, regression checks, and preparing the Sprint Review demo.
5. **All-or-Nothing Shipping Rule:** A story ships **complete or not at all**. Any story that is not 100% Done by Sprint Review is turned off with a feature flag, left out of the demo, and moved back to the Product Backlog for the next Sprint Planning.
