/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class'],
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

        primary: {
          DEFAULT: '#0E1A2B',
          accent: '#2D6A4F',
          highlight: '#A8C5B0',
          foreground: '#FFFFFF',
        },
        surface: {
          DEFAULT: '#0E1A2B',
          deep: '#070F1A',
          light: '#F5F2EE',
        },
        text: {
          DEFAULT: '#FFFFFF',
          secondary: '#8A9BAE',
          accent: '#A8C5B0',
          dark: '#0E1A2B',
        },
        border: {
          DEFAULT: '#8A9BAE',
          accent: '#2D6A4F',
        },
        state: {
          active: '#A8C5B0',
          idle: '#8A9BAE',
          fault: '#C8852A',
        },

        background: '#0E1A2B',
        foreground: '#FFFFFF',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0E1A2B',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#0E1A2B',
        },
        secondary: {
          DEFAULT: '#8A9BAE',
          foreground: '#0E1A2B',
        },
        muted: {
          DEFAULT: '#070F1A',
          foreground: '#8A9BAE',
        },
        accent: {
          DEFAULT: '#2D6A4F',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#C8852A',
          foreground: '#FFFFFF',
        },
        input: '#8A9BAE',
        ring: '#2D6A4F',
      },
      fontFamily: {
        display: ['Clash Display', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['General Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
