/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6c47ff',
          light: '#a855f7',
        },
      },
    },
  },
  plugins: [],
}
