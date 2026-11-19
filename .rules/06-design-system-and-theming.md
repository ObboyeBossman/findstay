# 06 — Design System & Theming Rules (No Hard-Coded Visual Values)

**Status:** Binding for every contributor and every AI agent, in every sprint.
**Source of truth:** `web/src/theme/tokens.css` (values) → `web/tailwind.config.js` (class names) → `web/src/lib/cn.ts` (class merging).
**Design source:** the *FindStay Design System Board* (palette, typography, buttons, status chips, search field, bottom navigation, icon buttons).

## 1. The Rule (T1)

> **No visual value may be written anywhere in the application code. Every colour, size, space, radius, border width, shadow, font, line height, z-index, duration and opacity comes from the token layer.**

Components consume tokens **only through Tailwind classes** generated from `tailwind.config.js`. If a value you need does not exist, you **add a token** (Section 5). You never inline the value.

## 2. Architecture of the Token Layer

| Layer | Where | Who may use it |
|-------|-------|----------------|
| **1. Palette** `--palette-<brand>-<50…950>` | `tokens.css` | Only `tokens.css`, `tailwind.config.js`, and the design-system preview (`web/src/design-system/`). Utility form: `palette-*`. |
| **2. Semantic roles** `--color-*`, `--space-*`, `--radius-*`, `--text-*` … | `tokens.css` | **Everything else.** Components use the Tailwind class (`bg-primary`, `text-muted`, `rounded-full`, `h-control-md`). |
| **3. Tailwind mapping** | `tailwind.config.js` | Contains **no values** — only names mapped to `var(--…)`. (Breakpoints are the one exception because CSS variables cannot be used inside media queries.) |

The default Tailwind theme is **replaced, not extended**. Off-system utilities (`bg-red-500`, `z-50`, `text-xl`, `rounded-3xl`, `p-[13px]`) do not exist and produce no CSS.

## 3. Forbidden (enforced by `npm run lint:theme`, which runs in `npm run build` and CI)

1. Hex / `rgb()` / `rgba()` / `hsl()` / `oklch()` colours, or named CSS colours, outside `web/src/theme/`.
2. Tailwind default colours or `white` / `black` (`bg-gray-100`, `text-white`, `border-black` …). Use `bg-surface-muted`, `text-inverse`, `border-border-strong`.
3. Tailwind arbitrary values (`p-[13px]`, `w-[calc(…)]`, `text-[#fff]`, `font-['Arial']`, `shadow-[…]`).
4. Literal `px` / `rem` / `em` lengths in TS, TSX, CSS, HTML or SVG; numeric inline style values (`style={{ padding: 12 }}`); numeric icon sizes (`<Icon size={24} />`).
5. Literal `font-family`; numeric `z-index` / `z-10`; literal durations or easings (`200ms`, `duration-200`); literal `box-shadow`.
6. `palette-*` classes or `var(--palette-*)` outside the theme layer and design-system preview.
7. Editing `tokens.css` or `tailwind.config.js` to "make a screen fit" without following Section 5.
8. Combining class names with anything other than `cn()` from `web/src/lib/cn.ts` (plain `twMerge` silently drops token classes — e.g. `text-label` next to `text-inverse`).

**Escape hatch** (exceptional, reviewed in PR): `// theme-lint-ignore: <reason the value cannot be a token>` on the line or directly above it. A reason is mandatory; a bare ignore is itself a violation. Example of a legitimate use: a third-party SDK that only accepts a literal colour string.

## 4. How to Style (Reference)

### 4.1 Colour roles

| Need | Class | Notes |
|------|-------|-------|
| Page background | `bg-canvas` | Ivory |
| Cards, panels, dialogs | `bg-surface` | White |
| Inputs, nav bar, progress track | `bg-surface-muted` | |
| Hairlines / input outline | `border-border` | |
| Emphasis outline ("Outlined" button) | `border-border-strong` | |
| Body / heading text | `text-text` | Earth |
| Placeholder, caption, helper | `text-muted` | |
| Text on filled brand surfaces | `text-inverse` | White |
| Primary action, active nav | `bg-primary` (`hover:bg-primary-hover`, `active:bg-primary-active`) | Olive |
| Reserve / key CTA, edit action | `bg-accent` (`hover:` / `active:` variants) | AA-contrast terracotta |
| Favourite / saved | `bg-favourite` | Brand terracotta |
| Inverted button, destructive icon | `bg-inverted` (`hover:bg-inverted-hover`) | Earth |
| Highlight, progress accent | `bg-highlight` | Sand |
| Keyboard focus | handled globally (`:focus-visible` → `ring-focus`) | Do not restyle per component |
| Status — Verified / Pending / Rejected | `text-success bg-success-subtle border-success-border` · `text-warning bg-warning-subtle border-warning-border` · `text-danger bg-danger-subtle border-danger-border` | Always icon **+** text (`NFR-07`) |

Opacity modifiers are allowed on colour tokens (`bg-overlay/50`).

### 4.2 Typography

Headlines: `font-headline` + `text-display | text-h1 | text-h2 | text-h3 | text-h4` (Roboto Black 900; 60/48/40/32/24 px on desktop, reduced automatically on phones).
Body: `text-body-lg` (20), `text-body` (16), `text-caption` (13) — Work Sans Regular 400.
Labels (buttons, form labels, chips, nav): `text-label` — Work Sans Medium 500, 16 px, 140 %.
Plain `<h1>`–`<h4>` already carry the right style via the base layer; use the classes only when the visual level differs from the semantic level.

### 4.3 Spacing, size, shape

- **Spacing** — the 4 px scale only: `p-1 … p-24`, `gap-*`, `m-*` (keys 0, px, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24).
- **Controls** — `h-control-sm | md | lg`. **`md` (44 px) is the default and the minimum touch target.** Icons: `h-icon-* w-icon-*`.
- **Radius** — `rounded-sm | md | lg | xl | full` (`full` for pill buttons, chips, circular icon buttons).
- **Border** — `border` (1 px) or `border-strong` (2 px). **Elevation** — `shadow-sm | md | lg`. **Layering** — `z-dropdown | sticky | nav | overlay | modal | toast`. **Motion** — `duration-fast | base | slow` + `ease-standard` (reduced-motion is honoured globally).
- **Layout** — `max-w-layout | content | form`. Breakpoints `sm | md | lg | xl`; **design mobile-first from 360 px** (`NFR-09`, `NFR-12`).

### 4.4 Reference recipes (from the board)

| Component | Classes |
|-----------|---------|
| Primary button | `h-control-md rounded-full bg-primary px-6 text-label text-inverse hover:bg-primary-hover` |
| Reserve button | `h-control-md rounded-full bg-accent px-6 text-label text-inverse hover:bg-accent-hover` |
| Inverted button | `h-control-md rounded-full bg-inverted px-6 text-label text-inverse hover:bg-inverted-hover` |
| Outlined button | `h-control-md rounded-full border border-border-strong bg-surface px-6 text-label text-text` |
| Status chip (Verified) | `inline-flex items-center gap-1 rounded-full border border-success-border bg-success-subtle px-3 text-caption text-success` |
| Search field | `h-control-md rounded-md border border-border bg-surface-muted px-4 text-body text-text` |

Variants are expressed as a **map of token class strings** inside the component — never as inline styles or computed values.

## 5. Adding or Changing a Token (the only way to introduce a new value)

1. Confirm the value is on the design board or has Product Owner approval. If it is a genuinely new brand decision, update the board first.
2. Add it to `web/src/theme/tokens.css` (semantic roles reference the palette where one exists; otherwise add the literal here, with a comment saying where it comes from).
3. Expose it in `web/tailwind.config.js` (name only, `var(--…)` only).
4. If it adds a new **class name** for font-size, font-family/weight, spacing key, z-index, border width, duration, easing, leading or opacity, register it in `web/src/lib/cn.ts` and add a case to the `cn()` test.
5. Run `npm run check`. Mention the new token in the PR description.
6. Never change an existing token's *meaning*; change its *value* only with Product Owner approval, because it re-themes the whole application.

## 6. Open Assumptions (confirm with the Product Owner)

The board does not state these; they are provisional values in `tokens.css`, marked `ASSUMPTION`:
heading line-height (1.1), body line-height (1.5), caption line-height (1.4), phone-size reductions of the display/h1/h2/h3 steps, and the shadow scale. No dark theme is defined on the board; dark values would be added as a second set of **semantic-layer** values without touching components.

## 7. Verification (part of the Definition of Done, `DoD-6`)

- `npm run check` (theme guard + type-check) passes locally and in CI.
- The screen renders correctly at 360 px and desktop widths using only token classes.
- No new entry added to `tokens.css` / `tailwind.config.js` without the Section 5 steps.
