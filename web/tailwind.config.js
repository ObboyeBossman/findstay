/**
 * FindStay Tailwind configuration.
 *
 * This file contains NO visual values. It only maps Tailwind class names onto the
 * CSS custom properties defined in src/theme/tokens.css (the single source of truth).
 *
 * The default Tailwind theme is intentionally REPLACED (not extended) so that
 * off-system utilities (bg-red-500, p-[13px], z-50, text-[#fff] ...) do not exist.
 * Rules: .rules/06-design-system-and-theming.md
 */

/** Colour role -> rgb() with alpha support (bg-primary/50). */
const color = (token) => `rgb(var(--color-${token}) / <alpha-value>)`;
const paletteColor = (name, step) => `rgb(var(--palette-${name}-${step}) / <alpha-value>)`;

const PALETTES = ['olive', 'terracotta', 'sand', 'ivory', 'earth'];
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/** Raw brand scales, exposed as `palette-<name>-<step>`. Allowed ONLY inside src/theme/ and the design-system preview. */
const palette = Object.fromEntries(
  PALETTES.map((name) => [
    name,
    Object.fromEntries(STEPS.map((step) => [step, paletteColor(name, step)])),
  ]),
);

const space = (name) => `var(--space-${name})`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    // Breakpoints cannot use CSS variables inside media queries, so they live here (and only here).
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },

    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      palette,

      canvas: color('canvas'),
      surface: color('surface'),
      'surface-muted': color('surface-muted'),
      overlay: color('overlay'),

      border: color('border'),
      'border-strong': color('border-strong'),

      text: color('text'),
      muted: color('text-muted'),
      inverse: color('text-inverse'),

      primary: { DEFAULT: color('primary'), hover: color('primary-hover'), active: color('primary-active') },
      accent: { DEFAULT: color('accent'), hover: color('accent-hover'), active: color('accent-active') },
      favourite: color('favourite'),
      'inverted': { DEFAULT: color('inverse'), hover: color('inverse-hover') },
      highlight: color('highlight'),
      focus: color('focus'),

      success: { DEFAULT: color('success'), subtle: color('success-subtle'), border: color('success-border') },
      warning: { DEFAULT: color('warning'), subtle: color('warning-subtle'), border: color('warning-border') },
      danger: { DEFAULT: color('danger'), subtle: color('danger-subtle'), border: color('danger-border') },
    },

    spacing: {
      0: space('0'),
      px: space('px'),
      0.5: space('0-5'),
      1: space('1'),
      1.5: space('1-5'),
      2: space('2'),
      3: space('3'),
      4: space('4'),
      5: space('5'),
      6: space('6'),
      8: space('8'),
      10: space('10'),
      12: space('12'),
      14: space('14'),
      16: space('16'),
      20: space('20'),
      24: space('24'),
      'control-sm': 'var(--size-control-sm)',
      'control-md': 'var(--size-control-md)',
      'control-lg': 'var(--size-control-lg)',
      'icon-sm': 'var(--size-icon-sm)',
      'icon-md': 'var(--size-icon-md)',
      'icon-lg': 'var(--size-icon-lg)',
    },

    maxWidth: {
      none: 'none',
      full: '100%',
      layout: 'var(--layout-max-width)',
      content: 'var(--layout-content-width)',
      form: 'var(--layout-form-width)',
    },

    fontFamily: {
      headline: 'var(--font-headline)',
      body: 'var(--font-body)',
    },

    fontWeight: {
      regular: 'var(--font-weight-regular)',
      medium: 'var(--font-weight-medium)',
      black: 'var(--font-weight-black)',
    },

    // text-<role> sets size + line-height (+ weight for headlines). Pair headlines with `font-headline`.
    fontSize: {
      display: ['var(--text-display)', { lineHeight: 'var(--leading-heading)', fontWeight: 'var(--font-weight-black)' }],
      h1: ['var(--text-h1)', { lineHeight: 'var(--leading-heading)', fontWeight: 'var(--font-weight-black)' }],
      h2: ['var(--text-h2)', { lineHeight: 'var(--leading-heading)', fontWeight: 'var(--font-weight-black)' }],
      h3: ['var(--text-h3)', { lineHeight: 'var(--leading-heading)', fontWeight: 'var(--font-weight-black)' }],
      h4: ['var(--text-h4)', { lineHeight: 'var(--leading-heading)', fontWeight: 'var(--font-weight-black)' }],
      'body-lg': ['var(--text-body-lg)', { lineHeight: 'var(--leading-body)', fontWeight: 'var(--font-weight-regular)' }],
      body: ['var(--text-body)', { lineHeight: 'var(--leading-body)', fontWeight: 'var(--font-weight-regular)' }],
      label: ['var(--text-label)', { lineHeight: 'var(--leading-label)', fontWeight: 'var(--font-weight-medium)' }],
      caption: ['var(--text-caption)', { lineHeight: 'var(--leading-caption)', fontWeight: 'var(--font-weight-regular)' }],
    },

    lineHeight: {
      heading: 'var(--leading-heading)',
      body: 'var(--leading-body)',
      label: 'var(--leading-label)',
    },

    borderRadius: {
      none: 'var(--radius-none)',
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      full: 'var(--radius-full)',
    },

    borderWidth: {
      DEFAULT: 'var(--border-width)',
      0: 'var(--space-0)',
      strong: 'var(--border-width-strong)',
    },

    ringWidth: { DEFAULT: 'var(--focus-ring-width)' },
    ringOffsetWidth: { DEFAULT: 'var(--focus-ring-offset)' },

    boxShadow: {
      none: 'none',
      sm: 'var(--shadow-sm)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
    },

    zIndex: {
      base: 'var(--z-base)',
      dropdown: 'var(--z-dropdown)',
      sticky: 'var(--z-sticky)',
      nav: 'var(--z-nav)',
      overlay: 'var(--z-overlay)',
      modal: 'var(--z-modal)',
      toast: 'var(--z-toast)',
    },

    transitionDuration: {
      fast: 'var(--duration-fast)',
      base: 'var(--duration-base)',
      slow: 'var(--duration-slow)',
    },
    transitionTimingFunction: {
      standard: 'var(--ease-standard)',
    },

    opacity: {
      0: '0',
      disabled: 'var(--opacity-disabled)',
      100: '1',
    },
  },

  plugins: [],
};
