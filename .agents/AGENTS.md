# FindStay — Agent Guide (Design Philosophy, Visual Language, Coding Standards)

Read this file in full before writing any code. The binding detail lives in `.rules/`; this file tells you what matters most and where to look.

## 1. Non-negotiable: no hard-coded visual values

**Never write a colour, spacing, size, radius, shadow, font, line-height, z-index or duration literal in any UI code.** Everything is centralised in one place and consumed through Tailwind classes.

| Don't | Do |
|-------|----|
| `#55624A`, `rgb(...)`, `bg-green-700`, `text-white` | `bg-primary`, `text-inverse` |
| `p-[13px]`, `style={{ padding: 12 }}`, `margin: 8px` | `p-3`, `gap-2` (4 px scale tokens) |
| `h-[44px]`, `<Icon size={24} />` | `h-control-md`, `className="h-icon-lg w-icon-lg"` |
| `rounded-[10px]`, `z-50`, `duration-200`, `font-['Arial']` | `rounded-md`, `z-modal`, `duration-base`, `font-body` |
| `twMerge(...)` or string concatenation of classes | `cn(...)` from `web/src/lib/cn.ts` |

- Values live in **`web/src/theme/tokens.css`** → mapped in **`web/tailwind.config.js`** → combined with **`web/src/lib/cn.ts`**.
- Need something that doesn't exist? **Add a token — never inline the value.** Procedure: `.rules/06-design-system-and-theming.md` §5.
- Components use **semantic** tokens (`bg-primary`, `text-muted`, `bg-success-subtle`). `palette-*` (raw brand scales) is for the theme layer and the design-system preview only.
- `npm run lint:theme` fails the build on violations. Do not work around it; the escape hatch (`// theme-lint-ignore: <reason>`) is for third-party constraints only and is reviewed in PR.

## 2. Design philosophy

FindStay helps people in Ghana (the board's search placeholder is *"Search Takoradi stays"*) find and trust a place to stay. The interface should feel **warm, grounded and trustworthy**, never flashy.

- **Trust first.** Verification state is a primary UI element, not decoration. Verified / Pending / Rejected chips always pair an **icon with text** — colour is never the only signal (`NFR-07`).
- **Simple and legible** for low-literacy and colour-vision-impaired users (`NFR-01`, `NFR-02`, `NFR-07`): clear labels, icon-based navigation (`NFR-05`), visible feedback for every action (`NFR-03`), accessible form controls (`NFR-04`).
- **Mobile-first.** Design for 360 px and up, no horizontal scrolling (`NFR-09`, `NFR-12`). Minimum touch target is `h-control-md` (44 px).
- **One consistent look across every module and portal** — guest, owner, staff and admin all use the same tokens and components.

## 3. Visual language (from the Design System Board)

- **Palette:** Olive (primary, trust), Terracotta (warmth, favourites), Sand (highlight, pending), Ivory (soft accent; the page canvas itself is white), Earth (text, inverted). Each has a 50–950 scale in `tokens.css`; use the semantic roles in `.rules/06-…` §4.1.
- **Type:** Headlines Roboto Black 900 (`font-headline text-h1`…); body Work Sans Regular 400 (`text-body`); labels Work Sans Medium 500 (`text-label`). Fonts are self-hosted via `@fontsource` — do not add a CDN or another family.
- **Shape:** pill buttons and chips (`rounded-full`), circular icon buttons, soft-rounded cards and inputs.
- **Components on the board:** Primary / Reserve / Inverted / Outlined buttons, status chips, search field, bottom navigation, circular and square icon buttons. Build these once as shared components and reuse them; recipes are in `.rules/06-…` §4.4.
- **Icons:** `lucide-react`, sized with `h-icon-*` / `w-icon-*`, coloured with text colour tokens (`text-current` inheritance).

## 4. Coding standards (frontend)

1. React + TypeScript (strict), Vite, Tailwind. Function components; no `any` without a comment explaining why.
2. Feature code lives in `web/src/features/<module>/` and mirrors the API modules; shared UI primitives go in `web/src/components/ui/`. Features do not import each other's internals.
3. The browser talks to Supabase **only for Auth**; all business data goes through `/api/v1` (`.rules/03-…` §2). Never put secrets in the frontend; only `VITE_*` publishable values.
4. Money is integer pesewas, formatted at the edge; time is UTC, displayed in `Africa/Accra` (`.rules/03-…` §3).
5. Accessibility is part of "done": labels on every control, visible focus (handled globally — don't remove it), semantic HTML, keyboard operable.
6. No dead code, no commented-out blocks, no `console.log` in committed code.

## 5. Before you say you're done

```
npm run check        # theme guard + type-check
npm run build        # includes the theme guard
```
Then confirm the screen at 360 px and desktop using only token classes. A story is not Done until `.rules/04-…` DoD is met.

## 6. Where things are

| Topic | File |
|-------|------|
| Theming, tokens, forbidden values, adding a token | `.rules/06-design-system-and-theming.md` |
| No-conflict contract, module boundaries, architecture & security, delivery gates, settled decisions | `.rules/01`–`05` |
| Token values | `web/src/theme/tokens.css` |
| Class-name mapping | `web/tailwind.config.js` |
| Class merging helper | `web/src/lib/cn.ts` |
| The guard | `scripts/check-theme.mjs` |
