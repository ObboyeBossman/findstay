# 04 — Scrum Delivery, Quality Gates & Priorities

## 1. Definition of Ready (DoR) — Before a Story Enters a Sprint

A story cannot be pulled into active sprint execution unless all five readiness checks pass (`100% Ready`):

1. **Traceable Requirement IDs:** Every requirement on the story (`FR-*`, `NFR-*`, `SEC-*`, `BRL-*`, `CON-*`, `UI-*`) is listed with its priority (`M` / `S` / `C`).
2. **Testable Acceptance Criteria:** Acceptance criteria are written in clear Given/When/Then or verifiable pass/fail outcomes.
3. **Dependencies & Decisions Resolved:** Blocking stakeholder decisions (`J-*`, `P-*`) have a confirmed decision or an agreed Day-N default fallback.
4. **Sized for a Single Sprint:** The story fits within 1–3 days of focused work and does not span across sprint boundaries.
5. **Seam & Boundary Impact Identified:** Any database migration number (`C2`), public `api` interface, or cross-module seam touched by the story is identified upfront.

---

## 2. Definition of Done (DoD) — Before a Story Is Marked Completed

A story is `100% Completed` only when all nine completion gates are satisfied:

1. **Code Complete & Merged:** Implemented on feature branch and merged to `main` via PR with zero compiler or linter warnings.
2. **Automated Tests Passing with `@Req` Tags:** Unit and integration tests cover every acceptance criterion and carry `@Req("...")` annotations.
3. **Spring Modulith Boundary Check Green:** `ApplicationModules.verify()` passes with zero illegal package dependencies (`C5`, `C6`).
4. **Database Migration Verified:** Flyway migration uses the sprint's reserved version range (`C2`), is strictly additive (`C1`), and upgrades cleanly from the previous release snapshot.
5. **Security & Tenant-Scope Checked:** Endpoint authorization, `OrgScope` isolation, input validation, and audit logging (`AuditRecorder`) are verified.
6. **Responsive UI & Accessibility Checked:** Works cleanly on mobile (`360px`+) and desktop viewports (`UI-01`..`UI-08`, `NFR-11`, `NFR-12`).
7. **Live on Staging:** Deployed to the live staging environment (Cloudflare Workers + Render + Supabase) with health checks green.
8. **Cumulative Regression Suite Green:** The full regression chain (`R1`..`Rn`) passes in CI.
9. **Demonstrated & Accepted:** Shown working end-to-end in the staging environment against the Sprint Review demo script and accepted by the Product Owner.

---

## 3. Priority Order & The Unfinished-Work Rule

1. **Strict Priority Order (`Must` → `Should` → `Could`):**
   - **Must (`M`):** Mandatory for the sprint goal and release gate. Built first (Days 1–7).
   - **Should (`S`):** High-value requirements started only after all dependent `Must` stories in the track are on schedule.
   - **Could (`C`):** Built only if `Must` and `Should` items are complete before feature freeze; otherwise dark-flagged or deferred.
2. **Day 2 Infrastructure & Provider Gate (Sprint 1):** Verify Supabase storage bucket limits, Render's non-sleeping hosting tier configuration, and SMS sender-ID status (`P-08`; activate email-only OTP fallback for `R1` if SMS sender-ID approval extends past Day 2).
3. **Day 3 Foundation Gate (Sprint 1):** If the walking skeleton (Story `01`: monorepo, CI, Flyway, staging deploy) is not live by the end of Day 3, all feature work swarms to unblock it.
4. **Day 8 Feature Freeze:** No new feature stories start after Day 8. Days 9–10 are reserved for end-to-end hardening, backup/restore drills, regression verification, and Sprint Review preparation.
5. **Whole-Story Shipping Rule:** A story ships **whole or not at all**. Any story that does not meet 100% of the Definition of Done by Sprint Review is switched off behind a `platform_setting` feature flag (`C7`), excluded from the release demo, and returned to the Product Backlog for re-prioritisation in the next Sprint Planning.
