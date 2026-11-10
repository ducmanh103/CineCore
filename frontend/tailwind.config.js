/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          indigo: '#4F46E5',
          violet: '#7C3AED',
          rose: '#F43F5E',
          coral: '#FB7185',
          amber: '#F59E0B',
          cyan: '#06B6D4',
        },
        surface: {
          50: '#FAFAFD',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #F43F5E 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #4338CA 0%, #6D28D9 50%, #E11D48 100%)',
        'brand-gradient-subtle': 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(244, 63, 94, 0.06) 100%)',
        'radial-luminous': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99, 102, 241, 0.12) 0%, rgba(244, 63, 94, 0.06) 45%, transparent 80%)',
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 20px 35px -5px rgba(15, 23, 42, 0.1), 0 8px 16px -3px rgba(79, 70, 229, 0.08)',
        'luminous': '0 10px 25px -4px rgba(79, 70, 229, 0.35)',
        'luminous-rose': '0 10px 25px -4px rgba(244, 63, 94, 0.35)',
        'luminous-amber': '0 10px 25px -4px rgba(245, 158, 11, 0.35)',
      },
    },
  },
  plugins: [],
};
