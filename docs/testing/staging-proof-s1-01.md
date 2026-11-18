# S1-01 Staging Proof — the skeleton is alive end to end

- **Task:** [S1-01-T16](../scrum/sprint-01/stories/S1-01/tasks/S1-01-T16.md) (issue #25)
- **Proven on:** 2026-11-18, against the staging build **2026-11-17T16:41:08Z** (the post-CORS-fix build published by PR #52)
- **Checked by:** the Product Owner's agent, on PO instruction (2026-11-17)

This is the recorded evidence that (1) the staging server reports itself healthy, and (2) the website actually talks to the server — a page request reaches the server and a real answer comes back. With this, feature work can safely begin.

## 1. The staging health check is green

`GET https://findstay-api-staging.onrender.com/actuator/health` (public, 2026-11-18):

```json
{"status":"UP","components":{"db":{"status":"UP"},"diskSpace":{"status":"UP"},
 "livenessState":{"status":"UP"},"ping":{"status":"UP"},"readinessState":{"status":"UP"}},
 "groups":["liveness","readiness"]}
```

`GET https://findstay-api-staging.onrender.com/api/v1/health` (public, TA-02's endpoint):

```json
{"status":"UP","components":{"db":{"status":"UP","details":{"database":"PostgreSQL",
 "validationQuery":"isValid()"}},"diskSpace":{"status":"UP"},…}}
```

**Fresh-build check** — `GET /actuator/info` reports `build.time = 2026-11-17T16:41:08Z`, i.e. the build made *after* the CORS fix merged to `dev` (#51, 16:38Z) and was published to staging (#52, 16:40Z). This is the new build, not the old one. A green health here also means Flyway applied `V1_01`–`V1_13` on boot — a boot that fails migrations never reports healthy (see [T15's note on #25](https://github.com/ObboyeBossman/findstay/issues/25)).

**The robot confirms it too** — the `dev → staging` publish pipeline itself waits for the new build and health green: run [44128511318](https://github.com/ObboyeBossman/findstay/actions/runs/44128511318) on `staging` = `completed / success` (16:40Z).

## 2. The website reaches the server and gets a real answer

A real browser (mobile 390×844 and desktop 1440×900) opened the staging website `https://findstay-web-staging.obboyebossman.workers.dev/`:

- The page renders: title **FindStay**, guest home H1 **"Find trusted stays across Ghana"**; the owner area `/owner` renders H1 **"Your properties, in one place"**. No page errors.
- The footer `SystemStatus` (TA-02's instrument) polls `/api/v1/health` every 30 s and shows **"API connected (UP)"** with the **green** dot — on both areas.
- The network log captured the cross-origin request actually leaving the browser and getting a real answer:

```text
GET https://findstay-api-staging.onrender.com/api/v1/health (Fetch) 200
```

This 200 is the proof the browser was allowed to call the API cross-origin — the CORS fix (#51/#52) live on staging. Before it, this same fetch failed and the dot stayed red.

## 3. Screenshots

| What | File |
| --- | --- |
| Guest home, mobile 390×844, full page — footer shows "API connected (UP)", green dot | [`assets/t16-staging-website-mobile.png`](assets/t16-staging-website-mobile.png) |
| Owner area `/owner`, desktop 1440×900 — footer shows "API connected (UP)" | [`assets/t16-staging-website-owner-desktop.png`](assets/t16-staging-website-owner-desktop.png) |

## 4. What this means for the team

The skeleton is alive end to end: browser → website → API → database, all on staging, verified by the deploy pipeline and by hand. Every Sprint 1 feature story can now build against a live, guarded environment. The repeat checks for future stories are already in the [R1 regression plan](regression-plan-r1.md) (R10 — staging health & API connection) and the [acceptance walkthrough](acceptance-walkthrough-sprint-1.md) Part A.
