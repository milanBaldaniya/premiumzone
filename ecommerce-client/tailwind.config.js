/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Shared luxury palette (identical across client & admin)
        primary: {
          DEFAULT: '#0F172A', // deep slate
          50: '#f8fafc',
          800: '#1e293b',
          900: '#0F172A',
          950: '#020617',
        },
        secondary: '#111827',
        accent: {
          DEFAULT: '#D4AF37', // luxury gold
          light: '#E6C767',
          dark: '#B8942A',
        },
        surface: '#F8FAFC',
        ink: '#111827',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(15, 23, 42, 0.12)',
        luxe: '0 20px 60px -20px rgba(15, 23, 42, 0.35)',
        gold: '0 8px 30px -8px rgba(212, 175, 55, 0.45)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #E6C767 50%, #B8942A 100%)',
        'dark-gradient': 'linear-gradient(160deg, #0F172A 0%, #1e293b 100%)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'fade-up': 'fade-up 0.5s ease-out',
      },
    },
  },
  plugins: [],
};
