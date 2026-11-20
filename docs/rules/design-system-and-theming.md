# Design System & Theming Rules (`T1` — no hard-coded visual values)

**Binding for every contributor and every AI agent.** Source of truth for values: [`web/src/theme/tokens.css`](../../web/src/theme/tokens.css). Class-name mapping: [`web/tailwind.config.js`](../../web/tailwind.config.js). Design reference: [`color-palette.md`](../design/color-palette.md), [`typography.md`](../design/typography.md).

## The rule

> **No colour, length, spacing, radius, border width, shadow, font, line height, tracking, z-index or duration literal may appear in application code.** Every one comes from `tokens.css` and is consumed through the Tailwind classes mapped in `tailwind.config.js`.

If a value you need does not exist, **add a token** (below). Never inline it, never "just this once".

## How it is built

| Layer | File | Contains |
|-------|------|----------|
| Values | `web/src/theme/tokens.css` | Every raw value. Colours are stored once as RGB channels (`--color-earth-ch`) so Tailwind can apply opacity; `--color-earth` is derived for plain CSS. Light mode only. |
| Names | `web/tailwind.config.js` | **No values** — only class names → `var(--…)`. Defaults for colour, spacing, radius, shadow, z-index, weight, tracking, line height, max-width, border width, font size/family and timing are *replaced*, so off-system classes (`bg-red-500`, `text-white`, `text-sm`, `p-[13px]`, `z-50`) do not exist. |
| Rules | `web/src/index.css`, `web/src/typography.css` | Element and class rules written **only with `var(--…)`**. |
| Guard | `scripts/check-theme.mjs` | `npm run lint:theme`; runs first in `npm run build`, so CI enforces it. |

## Forbidden (the guard fails the build)

1. Hex, `rgb()`, `hsl()`, `oklch()` or named CSS colours outside `web/src/theme/`.
2. Tailwind default colours, including `white` and `black` (`bg-white`, `text-white`, `bg-gray-100`).
3. Tailwind arbitrary values (`min-h-[3.75rem]`, `text-[11px]`, `max-w-[85vw]`, `bg-[#fff]`, `font-['Arial']`).
4. Literal `px` / `rem` / `em` in TS, TSX, CSS, HTML or SVG (media-query breakpoints are the one sanctioned exception — CSS variables cannot be used there); numeric inline styles (`style={{ padding: 12 }}`); numeric icon sizes (`<Icon size={24} />`).
5. A literal `font-family`; a numeric `z-index` / `z-10`; literal durations or easings; a literal `box-shadow`; Tailwind default font sizes (`text-sm`, `text-xl`).
6. Putting a value into `tailwind.config.js`, `index.css` or `typography.css` instead of `tokens.css`.

**Escape hatch** (rare, reviewed in PR): `// theme-lint-ignore: <why this cannot be a token>` on the line or directly above it. A reason is mandatory — a bare ignore is itself a violation. Legitimate example: a third-party SDK that accepts only a literal colour string.

## Vocabulary (what to write instead)

**Colour** — `bg-canvas` (page, white) · `bg-surface-card` (cards, panels, fields) · `bg-surface-muted` / `bg-surface-hover` · `bg-ivory`, `bg-sand` (supporting surfaces and accents only, never the page canvas) · `border-border-subtle` · `text-earth` (text) · `text-on-brand` (text on filled brand colours) · `bg-olive` / `hover:bg-olive-hover` (primary) · `bg-terracotta-dark` (contrast-safe CTA/text) · `bg-terracotta` (large accents, borders) · `bg-earth` (dark surfaces) · `status-{success|warning|error|info}-{bg|fg|border}` (always icon + text — `NFR-07`; `.fs-badge` encodes this). Opacity modifiers work on every colour token: `text-earth/75`, `bg-surface-card/95`.

**Type** — `text-display`, `text-heading-2…5`, `text-subtitle`, `text-label`, `text-body-1`, `text-body-2`, `text-caption`, plus `text-micro` (11 px) and `text-nano` (10 px) for nav labels and compact badges. Families `font-display` (Roboto), `font-sans` (Work Sans), `font-mono`. Weights `font-medium|semibold|bold|black`.

**Space & size** — the 4 px scale (`p-1 … p-96`, `gap-*`, `m-*`, `w-*`, `h-*`; keys `0, px, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5 … 96`) plus layout sizes `touch` (44 px minimum tap target — use `min-h-touch min-w-touch`), `rail` (60 px), `topbar`, `bottomnav`, `sidebar`, and `max-w-drawer`. `max-w-xs … max-w-7xl` are token-backed.

**Shape & depth** — `rounded-sm|md|lg|xl|2xl|3xl|full`, `border` / `border-2`, `shadow-sm|md|lg|xl|2xl`, `backdrop-blur`. **Layering** — `z-raised` (10), `z-sticky` (30), `z-overlay` (40), `z-top` (50, tooltips and toasts). **Motion** — `transition*` use the token duration and easing; `duration-fast|base|slow`; reduced-motion is honoured globally.

## Adding or changing a token

1. Confirm the value is in the design docs or has Product Owner approval; update `docs/design/` first if it is a new brand decision.
2. Add it to `web/src/theme/tokens.css` (colours as `--color-<name>-ch` plus the derived `--color-<name>`).
3. Map it in `web/tailwind.config.js` — name and `var(--…)` only.
4. Use the class. Run `npm run lint:theme`, `npm run typecheck`, `npm run build`.
5. Never change an existing token's *meaning*; change its *value* only with Product Owner approval, because it re-themes every screen.
6. If class merging with `tailwind-merge` is ever introduced, it must be configured with these token class names (unconfigured, it treats `text-label` as a colour and silently drops it next to `text-on-brand`).

## Verification (part of Done for every UI change)

`npm run lint:theme` passes · the screen is checked at 360 px and at desktop width using token classes only · status is never conveyed by colour alone.
