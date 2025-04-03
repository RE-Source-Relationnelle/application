import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        marianne: ['Marianne', 'sans-serif']
      },
      colors: {
        primary: '#000091',
        secondary: '#1212FF',
        tertiary: '#F5F5FE',
        light: '#E1010E',
        black: '#000000',
        grayBold: '#3A3A3A',
        white: '#FFFFFF',
        textLight: '#666666',
      }
    }
  },
  plugins: [],
} satisfies Config