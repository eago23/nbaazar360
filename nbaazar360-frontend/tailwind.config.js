/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#B54B4B',
          dark: '#8B3A3A',
          light: '#D46A6A'
        },
        secondary: {
          DEFAULT: '#2D2D2D',
          light: '#4A4A4A'
        },
        accent: {
          DEFAULT: '#F5E6D3',
          gold: '#D4A574'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
