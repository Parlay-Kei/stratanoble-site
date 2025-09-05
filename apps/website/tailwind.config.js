/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/data/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // Legacy pages directory
    './public/**/*.html',
  ],
  // Safelist commonly used classes to prevent purging
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
    // Dynamic color classes that might be generated
    'text-navy-900',
    'text-emerald-600',
    'bg-emerald-600',
    'hover:bg-emerald-700',
    // Common utility classes
    'transition-all',
    'duration-300',
    'transform',
    'scale-105',
    // Logo height classes to prevent purging
    'h-12',
    'h-14',
    'h-16',
    'h-20',
    'h-24',
    'h-32',
    'h-48',
    'h-64',
    'w-auto',
    // Header height classes
    'brightness-0',
    'invert',
  ],
  // Enable dark mode using a class
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        // Strata Noble Brand Colors
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#2d3748',
          900: '#1a202c',
          DEFAULT: '#003366',
        },
        silver: {
          50: '#f8f9fa',
          100: '#f1f3f4',
          200: '#e8eaed',
          300: '#dadce0',
          400: '#bdc1c6',
          500: '#9aa0a6',
          600: '#80868b',
          700: '#5f6368',
          800: '#3c4043',
          900: '#202124',
          DEFAULT: '#C0C0C0',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          DEFAULT: '#047857', // Darker green for better contrast (was #50C878)
        },
        // New brand colors
        'dark-purple': '#30232d',
        'accent-red': '#d55053',
        'accent-gold': '#f1c095',
        'accent-cream': '#fae9d7',
        // Brand colors for semantic usage
        brand: {
          navy: '#003366',
          silver: '#C0C0C0',
          emerald: '#047857', // Updated for better accessibility
          light: '#C0C0C0',   // for text on dark bg
          dark: '#003366',    // for text on light bg
        },
        // Semantic colors
        primary: {
          DEFAULT: '#003366',
          hover: '#002855',
          active: '#001f3f',
        },
        accent: {
          DEFAULT: '#047857', // Updated for better accessibility
          hover: '#059669',
          active: '#065f46',
        },
        neutral: {
          DEFAULT: '#C0C0C0',
          hover: '#b0b0b0',
          active: '#a0a0a0',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        serif: ['var(--font-bitter)', 'Bitter', 'serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg, #003366 0%, #047857 100%)',
        'gradient-accent': 'linear-gradient(90deg, #047857 0%, #003366 100%)',
        'gradient-neutral': 'linear-gradient(90deg, #C0C0C0 0%, #f8f9fa 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      backdropBlur: {
        'glass': '8px',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
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
