
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#1B263B',
        navy: '#003366',
        emerald: '#50C878',
        mist: '#DDE2E9',
        bone: '#F5F1EB'
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif']
      }
    }
  },
  plugins: []
}
