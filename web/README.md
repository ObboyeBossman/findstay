# findstay-web

The FindStay web application — React 18 + TypeScript + Vite + Tailwind CSS,
mobile-first (`360px`+). This is the starter shell from **S1-01-T5**: the
guest, account, owner and admin areas are routed and openable, each an empty
page waiting for its story's screens.

## Run it

```bash
# from the repository root (npm workspaces)
npm install
npm run dev            # http://localhost:3000, proxies /api to localhost:8080
```

Or from `web/` directly: `npm run dev`.

- `npm run typecheck` — TypeScript check.
- `npm run build` — production build into `dist/` (also runs typecheck).
- `npm run preview` — serve the production build locally.

The dev server proxies `/api/*` to the Spring Boot API on
`localhost:8080` (`vite.config.ts`), so the footer's system status shows the
real backend health once the API is running.

## Configuration

Copy `.env.example` to `.env` for local overrides. Only `VITE_` variables
are safe for the browser:

| Variable | Purpose |
| :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of the Spring REST API (default `/api/v1`; the staging build sets the full `https://…onrender.com/api/v1`). |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase Auth (auth only — never business data). |

## Routing map (the shell)

| Route | Area | Screens land with |
| :--- | :--- | :--- |
| `/` | Guest marketplace home | S1-03 onward (search, stays, booking) |
| `/auth/sign-in`, `/auth/sign-up`, `/auth/forgot-password` | Account | S1-04, S1-05 |
| `/owner/*` | Owner / company | S1-07, S1-12, S1-13, S1-14 |
| `/admin/*` | Admin | S1-15, S1-16 |
| `*` | 404 page | — |

Every route resolves today; each area entry says which story fills it.

## Where screens go

`src/features/<module>/` — one folder per backend module; see
[`src/features/README.md`](./src/features/README.md) for the mapping.
Shared chrome lives in `src/components/`; cross-cutting client helpers in
`src/lib/` (`api.ts` owns the API base URL convention).

## Staging

Deployed as Cloudflare Workers Static Assets (`wrangler.jsonc`,
`findstay-web-staging`); `npm run build` produces `dist/` and
`npx wrangler deploy` publishes it. CI publishes on green (S1-01-T11).
