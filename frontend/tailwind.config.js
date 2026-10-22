/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exact Gold & Yellow Theme Palette
        'primary-gold': '#D99A00',
        'primary-yellow': '#FFC107',
        'button-hover': '#E5A900',
        'light-gold': '#FFF8E6',
        'soft-yellow': '#FFFDF5',
        'main-bg': '#FFFEFA',
        'card-bg': '#FFFFFF',
        'main-heading': '#111827',
        'body-text': '#4B5563',
        'secondary-text': '#64748B',
        'border-gold': '#F1E7CF',
        'gold-accent': '#F5B301',

        // Theme & Semantic Aliases
        'deep-blue': '#111827',
        'teal-primary': '#D99A00',
        'light-mint': '#FFFEFA',
        'pure-white': '#FFFFFF',
        'light-teal': '#FFF8E6',

        brand: {
          DEFAULT: '#D99A00',
          sidebar: '#111827',
          dark: '#111827',
          navy: '#111827',
          card: '#FFFFFF',
          accent: '#D99A00',
          highlight: '#FFF8E6',
          bg: '#FFFEFA',
        },

        // Map teal to the Gold & Yellow spectrum for seamless legacy compatibility
        teal: {
          50: '#FFFDF5',
          100: '#FFF8E6',
          200: '#F1E7CF',
          300: '#F1E7CF',
          400: '#F5B301',
          500: '#D99A00',
          600: '#D99A00',
          700: '#B45309',
          800: '#111827',
          900: '#111827',
          950: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(180, 130, 20, 0.08), 0 1px 2px -1px rgba(180, 130, 20, 0.04)',
        'card': '0 2px 4px 0 rgba(180, 130, 20, 0.06)',
        'card-hover': '0 6px 14px -2px rgba(180, 130, 20, 0.12)',
        'elevation': '0 12px 24px -4px rgba(180, 130, 20, 0.15)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}
