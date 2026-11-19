/**
 * FindStay Tailwind configuration.
 *
 * This file contains NO visual values: it only maps class names onto the CSS custom
 * properties in src/theme/tokens.css (the single source of truth).
 * The Tailwind defaults for colour, spacing, radius, shadow, z-index, weight, tracking,
 * line-height, max-width, border width, font size/family and timing are REPLACED, so
 * off-system utilities (bg-red-500, text-white, text-sm, p-[13px] ...) do not exist.
 * Rules: docs/rules/design-system-and-theming.md
 */

/** Colour token -> rgb() with alpha support (text-earth/75, bg-surface-card/70). */
const color = (token) => `rgb(var(--color-${token}-ch) / <alpha-value>)`;

const SPACING_KEYS = [
  '0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14',
  '16', '20', '24', '28', '32', '36', '40', '44', '48', '52', '56', '60', '64', '72', '80', '96',
];
const spacing = {
  ...Object.fromEntries(SPACING_KEYS.map((key) => [key, `var(--space-${key.replace('.', '-')})`])),
  px: 'var(--space-px)',
  touch: 'var(--size-touch)',
  rail: 'var(--size-rail)',
  topbar: 'var(--size-topbar)',
  bottomnav: 'var(--size-bottomnav)',
  sidebar: 'var(--size-sidebar)',
};

const MAX_WIDTHS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'];

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      olive: { DEFAULT: color('olive'), hover: color('olive-hover') },
      terracotta: { DEFAULT: color('terracotta'), dark: color('terracotta-dark') },
      sand: color('sand'),
      ivory: color('ivory'),
      earth: color('earth'),
      canvas: color('canvas'),
      'on-brand': color('on-brand'),
      surface: {
        card: color('surface-card'),
        muted: color('surface-muted'),
        hover: color('surface-hover'),
      },
      border: { subtle: color('border-subtle') },
      status: {
        'success-bg': color('status-success-bg'),
        'success-fg': color('status-success-fg'),
        'success-border': color('status-success-border'),
        'warning-bg': color('status-warning-bg'),
        'warning-fg': color('status-warning-fg'),
        'warning-border': color('status-warning-border'),
        'error-bg': color('status-error-bg'),
        'error-fg': color('status-error-fg'),
        'error-border': color('status-error-border'),
        'info-bg': color('status-info-bg'),
        'info-fg': color('status-info-fg'),
        'info-border': color('status-info-border'),
      },
    },

    // A bare `border` uses the palette's hairline colour, never an off-palette grey.
    borderColor: ({ theme }) => ({ ...theme('colors'), DEFAULT: color('border-subtle') }),

    spacing,

    fontFamily: {
      display: ['var(--font-display)'],
      sans: ['var(--font-sans)'],
      mono: ['var(--font-mono)'],
    },

    fontSize: {
      display: ['var(--font-size-display)', { lineHeight: 'var(--leading-display)', letterSpacing: 'var(--tracking-display)' }],
      'heading-2': ['var(--font-size-heading-2)', { lineHeight: 'var(--leading-heading-2)' }],
      'heading-3': ['var(--font-size-heading-3)', { lineHeight: 'var(--leading-heading-3)' }],
      'heading-4': ['var(--font-size-heading-4)', { lineHeight: 'var(--leading-heading-4)' }],
      'heading-5': ['var(--font-size-heading-5)', { lineHeight: 'var(--leading-heading-5)' }],
      subtitle: ['var(--font-size-subtitle)', { lineHeight: 'var(--leading-subtitle)' }],
      label: ['var(--font-size-label)', { lineHeight: 'var(--leading-label)' }],
      'body-1': ['var(--font-size-body-1)', { lineHeight: 'var(--leading-body-1)' }],
      'body-2': ['var(--font-size-body-2)', { lineHeight: 'var(--leading-body-2)' }],
      caption: ['var(--font-size-caption)', { lineHeight: 'var(--leading-caption)' }],
      micro: 'var(--font-size-micro)',
      nano: 'var(--font-size-nano)',
    },

    fontWeight: {
      normal: 'var(--font-weight-regular)',
      regular: 'var(--font-weight-regular)',
      medium: 'var(--font-weight-medium)',
      semibold: 'var(--font-weight-semibold)',
      bold: 'var(--font-weight-bold)',
      black: 'var(--font-weight-black)',
    },

    lineHeight: {
      none: 'var(--leading-none)',
      tight: 'var(--leading-tight)',
      snug: 'var(--leading-snug)',
      normal: 'var(--leading-normal)',
      relaxed: 'var(--leading-relaxed)',
    },

    letterSpacing: {
      tight: 'var(--tracking-tight)',
      normal: '0',
      wide: 'var(--tracking-wide)',
      wider: 'var(--tracking-wider)',
    },

    maxWidth: {
      none: 'none',
      full: '100%',
      min: 'min-content',
      max: 'max-content',
      fit: 'fit-content',
      drawer: 'var(--size-drawer-max)',
      ...Object.fromEntries(MAX_WIDTHS.map((key) => [key, `var(--max-w-${key})`])),
    },

    borderRadius: {
      none: '0',
      sm: 'var(--radius-sm)',
      DEFAULT: 'var(--radius)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      '2xl': 'var(--radius-2xl)',
      '3xl': 'var(--radius-3xl)',
      full: 'var(--radius-full)',
    },

    borderWidth: {
      DEFAULT: 'var(--border-width)',
      0: '0',
      2: 'var(--border-width-2)',
      4: 'var(--border-width-4)',
      8: 'var(--border-width-8)',
    },

    boxShadow: {
      sm: 'var(--shadow-sm)',
      DEFAULT: 'var(--shadow)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
      xl: 'var(--shadow-xl)',
      '2xl': 'var(--shadow-2xl)',
      inner: 'var(--shadow-inner)',
      none: 'none',
    },

    zIndex: {
      auto: 'auto',
      0: '0',
      raised: 'var(--z-raised)',
      sticky: 'var(--z-sticky)',
      overlay: 'var(--z-overlay)',
      top: 'var(--z-top)',
    },

    blur: { DEFAULT: 'var(--blur)' },
    backdropBlur: { DEFAULT: 'var(--blur)' },

    transitionDuration: {
      DEFAULT: 'var(--duration-default)',
      fast: 'var(--duration-fast)',
      base: 'var(--duration-base)',
      slow: 'var(--duration-slow)',
    },
    transitionTimingFunction: {
      DEFAULT: 'var(--ease-default)',
    },

    extend: {
      minHeight: { touch: 'var(--size-touch)', rail: 'var(--size-rail)' },
      minWidth: { touch: 'var(--size-touch)', rail: 'var(--size-rail)' },
    },
  },
  plugins: [],
};
