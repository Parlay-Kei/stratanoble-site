/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Safelist commonly used classes
  safelist: [
    'bg-white',
    'text-white',
    'border-white',
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
          DEFAULT: '#50C878',
        },
        // Semantic colors
        primary: {
          DEFAULT: '#003366',
          hover: '#002855',
          active: '#001f3f',
        },
        accent: {
          DEFAULT: '#50C878',
          hover: '#45b36b',
          active: '#3a9e5e',
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
        'gradient-primary': 'linear-gradient(90deg, #003366 0%, #50C878 100%)',
        'gradient-accent': 'linear-gradient(90deg, #50C878 0%, #003366 100%)',
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
    require('tailwindcss-animate'),
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
}