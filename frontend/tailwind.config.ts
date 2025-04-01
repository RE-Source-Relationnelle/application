import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  important: true,
  theme: {
    fontFamily: {
      marianne: ['Marianne', 'sans-serif']
    },
    extend: {
      colors: {
        primary: '#000091',
        secondary: '#1212FF',
        tertiary: '#F5F5FE',
        grey: '#F6F6F6',
        black: '#000000',
        white: '#FFFFFF',
      }
    }
  },
  plugins: [],
} satisfies Config