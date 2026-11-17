# Feature folders — one per backend module

Each folder in `src/features/` mirrors one backend module of the Spring
Modulith monolith (`api/src/main/java/com/findstay/<module>/`). Screens,
routes and client state for a domain live in its folder — never in another
feature's folder, matching the backend's `api` vs `internal` boundary rules
(`docs/rules/module-boundaries.md`).

| Folder | Backend module | What lands there | Sprint stories |
| :--- | :--- | :--- | :--- |
| `identity/` | `identity` | Sign-up, sign-in, profile, consent capture | S1-04, S1-05, S1-11 |
| `organization/` | `organization` | Company space, staff invitations | S1-07 |
| `verification/` | `verification` | Ghana Card & property verification uploads | S1-12 |
| `listing/` | `listing` | Properties, rooms, prices | S1-13 |
| `availability/` | `availability` | Room availability calendar | S1-14 |
| `media/` | `media` | Photo & document upload flows | S1-09 |
| `audit/` | `audit` | Permanent activity log views | S1-08 |
| `notification/` | `notification` | Alerts centre, preferences | S1-10 |
| `admin/` | `admin` | Listing review, users, platform settings | S1-15, S1-16 |

Rules that keep the shell healthy:

- Cross-feature code goes through `src/lib/` helpers or a feature's public
  exports — reach into another feature's internals the way the backend
  forbids it, and the module-boundary check culture applies here too.
- Browser business data only via `src/lib/api.ts` (`/api/v1/...`, TA-02);
  Supabase (`src/lib/supabase.ts`) is for authentication only.
- Shared chrome (layout, navigation, system status) lives in
  `src/components/`, not in a feature folder.
