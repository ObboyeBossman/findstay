/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
      },
      fontSize: {
        display: ['var(--font-size-display)', { lineHeight: '1.1', letterSpacing: '-0.125rem' }],
        'heading-2': ['var(--font-size-heading-2)', { lineHeight: '1.15' }],
        'heading-3': ['var(--font-size-heading-3)', { lineHeight: '1.2' }],
        'heading-4': ['var(--font-size-heading-4)', { lineHeight: '1.25' }],
        'heading-5': ['var(--font-size-heading-5)', { lineHeight: '1.3' }],
        subtitle: ['var(--font-size-subtitle)', { lineHeight: '1.35' }],
        label: ['var(--font-size-label)', { lineHeight: '1.35' }],
        'body-1': ['var(--font-size-body-1)', { lineHeight: '1.5' }],
        'body-2': ['var(--font-size-body-2)', { lineHeight: '1.5' }],
        caption: ['var(--font-size-caption)', { lineHeight: '1.4' }],
      },
      colors: {
        olive: {
          DEFAULT: 'var(--color-olive)',
          hover: 'var(--color-olive-hover)',
        },
        terracotta: {
          DEFAULT: 'var(--color-terracotta)',
          dark: 'var(--color-terracotta-dark)',
        },
        sand: 'var(--color-sand)',
        ivory: 'var(--color-ivory)',
        earth: 'var(--color-earth)',
        surface: {
          card: 'var(--color-surface-card)',
          muted: 'var(--color-surface-muted)',
          hover: 'var(--color-surface-hover)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
        },
        status: {
          'success-bg': 'var(--color-status-success-bg)',
          'success-fg': 'var(--color-status-success-fg)',
          'success-border': 'var(--color-status-success-border)',
          'warning-bg': 'var(--color-status-warning-bg)',
          'warning-fg': 'var(--color-status-warning-fg)',
          'warning-border': 'var(--color-status-warning-border)',
          'error-bg': 'var(--color-status-error-bg)',
          'error-fg': 'var(--color-status-error-fg)',
          'error-border': 'var(--color-status-error-border)',
          'info-bg': 'var(--color-status-info-bg)',
          'info-fg': 'var(--color-status-info-fg)',
          'info-border': 'var(--color-status-info-border)',
        },
      },
      spacing: {
        touch: '2.75rem', /* 44px minimum mobile tap target */
        topbar: '3.5rem', /* 56px mobile top bar */
        bottomnav: '4rem', /* 64px mobile bottom nav */
        sidebar: '15rem', /* 240px desktop sidebar */
      },
      minHeight: {
        touch: '2.75rem',
      },
      minWidth: {
        touch: '2.75rem',
      },
    },
  },
  plugins: [],
};
