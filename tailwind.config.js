/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#003366",
        silver: "#C0C0C0",
        emerald: "#50C878"
      }
    }
  },
  plugins: [],
} 