/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'safety-block': '#7f1d1d',
        'safety-warn': '#78350f',
        'safety-ok': '#064e3b',
        'safety-neutral': '#1e1b4b',
      },
    },
  },
  plugins: [],
}
