/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkSidebar: '#0f172a', // Slate 900
        accentBlue: '#3b82f6',
        accentGreen: '#10b981',
        accentRed: '#ef4444',
        accentYellow: '#f59e0b',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
