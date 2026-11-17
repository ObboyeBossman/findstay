# Regression Plan R1 — the repeat-test list

**Story:** [S1-01](../scrum/sprint-01/stories/S1-01/README.md) · **Task:** [S1-01-T13](../scrum/sprint-01/stories/S1-01/tasks/S1-01-T13.md) (issue #22)
**Companion:** [Acceptance walkthrough](./acceptance-walkthrough-sprint-1.md) — the click-by-click review script.

**The rule (scrum rules §2, DoD 8):** after *every* change, everything that worked before must still work. This list is the cumulative chain for Release `R1` — it only grows. The CI robot already repeats R1–R8 on every proposal automatically; R9–R10 repeat on every publish to staging; a human repeats the manual checks (M-series) after each story lands and before the Sprint Review.

## Automatic — the robot, on every proposal and every `staging` push

| # | Check | How it runs | Expected |
| :--- | :--- | :--- | :--- |
| R1 | The website typechecks and production-builds | CI job `web — typecheck & build` | green, `dist/` produced |
| R2 | The api test suite passes on a real throwaway database | CI job `api — tests, @Req & module boundaries` (Testcontainers PostgreSQL, Flyway 13/13) | 65+ tests, 0 failures, 0 skipped |
| R3 | Every test is labelled with the requirement it proves | `RequirementTaggingTest` inside R2 | 0 unlabelled/blank tests; the deliberately untagged samples are still flagged |
| R4 | Modules do not reach into each other | `ApplicationModules.verify()` inside R2 | boundary check passes (invariant C5) |
| R5 | The Sprint 1 database guarantees bite | `ThrowawayDatabaseHarnessTest` inside R2: audit append-only under `findstay_app` (S1-08-AC2), no overlapping blocks (S1-14-AC2), the T15 reference values present (DEC-S1-01/L) | all pass on the real engine |
| R6 | Migrations are additive and apply cleanly from scratch | R2 spins a **fresh** PostgreSQL per run and applies `V1_01`–`V1_13` | Flyway succeeds on an empty database every time |
| R7 | Security baseline: health public, business endpoints locked | `PlatformHealthApiTest` inside R2 | `/api/v1/health` 200 UP / 503 DOWN; anything else 401 |
| R8 | Deploy verification | CI job `publish — staging, only on green`, on `staging` pushes | new `build.time` on `/actuator/info` **and** `{"status":"UP"}` on `/actuator/health`; otherwise the pipeline is red |

## Automatic — on demand (run these the same way after any schema or staging change)

| # | Check | How to run | Expected |
| :--- | :--- | :--- | :--- |
| R9 | A clean database rebuilds byte-identically, and seeds are idempotent | `createdb scratch && flyway -url=…scratch -locations=filesystem:api/src/main/resources/db/migration migrate`, then re-run `V1_13` by hand via psql | 13/13 applied, validate clean; accommodation types 7, billing periods 4 (only `NIGHTLY` active), settings 3; the re-run inserts nothing |
| R10 | The staging database received the same migrations | `curl https://findstay-api-staging.onrender.com/actuator/health` right after a publish | `UP` with the `db` component `UP` (a Flyway failure would have kept the boot from going healthy) |

## Manual — a human, after each story lands and before the Sprint Review

| # | Check | Expected | Source story |
| :--- | :--- | :--- | :--- |
| M1 | The three portal areas still route (guest `/`, `/auth/*`, `/owner/*`, `/admin/*`, 404) | every area opens; no horizontal scroll at 360px | T5 |
| M2 | The website still reaches the server: footer system status on staging | green dot, `API connected (UP)` | T5/T11/T16 |
| M3 | The design language still comes from the single token file | change a palette token locally → the whole app shifts; revert | T2 |
| M4 | Sign-up → consent → confirm → sign-in round trip, email method | works with the R1 email-link flow; the consent records reference policy version 1 | S1-04, S1-11 (when landed) |
| M5 | Company isolation: a second owner sees nothing of the first | cross-company reads return 404/empty, never data | S1-07 (when landed) |
| M6 | The permanent log records the story's actions; no edit/delete path exists | newest-first entries with actor/action/entity/time | S1-08 (when landed) |
| M7 | Photos upload (≤5 MB, ≤10 per property), documents (≤10 MB) with clear rejections | oversized files refused with readable messages | S1-09 (when landed) |
| M8 | Listing lifecycle: DRAFT → PENDING_REVIEW → ACTIVE, and the guest search shows the approved listing | status transitions visible; approval makes it public | S1-13/S1-15 (when landed) |
| M9 | Overlapping calendar blocks rejected in the UI, not just the database | the second overlapping block is refused with a clear message | S1-14 (when landed) |
| M10 | The backup restore drill | a restored scratch database contains the demo data | S1-02 (when landed) |

> When a story lands, its M-row becomes part of the chain; the robot rows (R1–R10) are already wired. New checks are **added**, never silently replaced — the same all-or-nothing rule the sprint ships by.
