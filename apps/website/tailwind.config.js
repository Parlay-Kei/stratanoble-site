/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/data/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './public/**/*.html',
  ],
  safelist: [
    'bg-white',
    'text-white',
    'border-white',
    'hover:bg-white',
    'hover:text-white',
    'bg-white/10',
    'bg-white/20',
    'bg-white/5',
    'border-white/20',
    'border-white/30',
    'transition-colors',
    'duration-200',
    'h-12',
    'h-14',
    'h-16',
    'h-20',
    'h-24',
    'h-32',
    'h-48',
    'h-64',
    'w-auto',
    'brightness-0',
    'invert',
    {
      pattern:
        /^(bg|text|border)-(command-navy|forest-green|field-sage|slate-grey|void|fault-amber|off-white)(\/\d+)?$/,
    },
    {
      pattern:
        /^(hover:)?(bg|text|border)-(command-navy|forest-green|field-sage|slate-grey|void)(\/\d+)?$/,
    },
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
        display: ['var(--font-display)', 'Playfair Display', 'Georgia', 'serif'],
        sans: [
          'var(--font-body)',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
        mono: ['var(--font-mono)', 'IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
}
