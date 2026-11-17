/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
      },
      colors: {
        olive: 'var(--color-olive)',
        terracotta: 'var(--color-terracotta)',
        sand: 'var(--color-sand)',
        ivory: 'var(--color-ivory)',
        earth: 'var(--color-earth)',
      },
    },
  },
  plugins: [],
};
