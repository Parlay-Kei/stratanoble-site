/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'command-navy': '#0E1A2B',
        'forest-green': '#2D6A4F',
        'field-sage': '#A8C5B0',
        'slate-grey': '#8A9BAE',
        void: '#070F1A',
        'fault-amber': '#C8852A',
        'off-white': '#F5F2EE',
      },
      fontFamily: {
        display: ['Clash Display', 'sans-serif'],
        sans: ['General Sans', 'Satoshi', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
