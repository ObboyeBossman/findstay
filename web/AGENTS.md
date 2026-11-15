# Web agent guide

## Scope and structure

`web/` is the FindStay React 18 + TypeScript + Vite application. Put domain UI in `src/features/<domain>/`; keep small cross-cutting client helpers in `src/lib/`. The existing feature directories are planned ownership boundaries, not delivered screens.

`src/lib/api.ts` owns the API base URL convention. Browser business data must use the Spring REST API under `/api/v1`; use Supabase only for authentication flows. Never place database credentials, service-role keys, or business-data access in the client.

## UI and verification

- Build mobile-first, accessible guest, owner/staff, and administrator experiences. Check the relevant functional and non-functional requirements before introducing a workflow.
- Treat authorization as API-enforced; client checks are for experience, not security.
- Use `VITE_` variables only for safe browser configuration. Document new variables in `.env.example` with no secrets.
- Run `npm run typecheck` for TypeScript changes and `npm run build` for a production build. Do not edit `dist/`.
