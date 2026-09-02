/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e5ff',
          200: '#bcd0ff',
          300: '#8eb1ff',
          400: '#5886fc',
          500: '#335ff5',
          600: '#1f40ea',
          700: '#1a31d6',
          800: '#1c2ba9',
          900: '#1c2b85',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
