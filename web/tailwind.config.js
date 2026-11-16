/** @type {import('tailwindcss').Config} */
// All colors resolve to the design tokens defined in src/theme.css (S1-01-T2),
// so restyling the app means editing that one file — utilities follow instantly.
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary action (red) — CTAs, active states, danger
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
          subtle: 'var(--color-primary-subtle)',
          contrast: 'var(--color-primary-contrast)',
        },
        // Structure & nav (blue) — chrome, links, focus rings, info
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          hover: 'var(--color-secondary-hover)',
          light: 'var(--color-secondary-light)',
          subtle: 'var(--color-secondary-subtle)',
          contrast: 'var(--color-secondary-contrast)',
        },
        // Surfaces
        surface: {
          base: 'var(--color-bg-base)',
          card: 'var(--color-bg-surface)',
          muted: 'var(--color-bg-muted)',
          nav: 'var(--color-bg-nav)',
          'nav-dark': 'var(--color-bg-nav-dark)',
        },
        // Text
        ink: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          link: 'var(--color-text-link)',
          danger: 'var(--color-text-danger)',
          success: 'var(--color-text-success)',
          'on-brand': 'var(--color-text-on-brand)',
        },
        // Borders
        line: {
          subtle: 'var(--color-border-subtle)',
          DEFAULT: 'var(--color-border-default)',
          strong: 'var(--color-border-strong)',
          focus: 'var(--color-border-focus)',
          danger: 'var(--color-border-danger)',
        },
        // Status colors
        success: 'var(--green)',
        warning: 'var(--amber)',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['SF Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '9999px',
      },
    },
  },
  plugins: [],
};
