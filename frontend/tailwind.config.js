/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ncc: {
          canvas: '#080B11',
          footer: '#05070B',
          surface: '#121722',
          card: '#0E131D',
          elevated: '#1B2230',
          muted: '#8B9BB4',
          red: '#FF385C',
          coral: '#FF7A63',
        },
        obsidian: {
          950: '#080B11',
          900: '#05070B',
          850: '#0E131D',
          800: '#121722',
          700: '#1B2230',
          600: '#334155',
        },
        brand: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          400: '#FF7A63',
          500: '#FF4D6D',
          600: '#FF385C',
          700: '#E11D48',
          crimson: '#FF385C',
          indigo: '#6366F1',
          cyan: '#06B6D4',
          gold: '#F59E0B',
          emerald: '#10B981',
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Be Vietnam Pro"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #E11D48 0%, #FF385C 46%, #FF7A63 100%)',
        'ncc-red': 'linear-gradient(135deg, #FF385C 0%, #FF575F 48%, #FF8A65 100%)',
        'ncc-outline':
          'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
        'ncc-underline':
          'linear-gradient(90deg, #FF385C 0%, #F59E0B 55%, rgba(255, 255, 255, 0.2) 100%)',
        'cinema-spotlight':
          'radial-gradient(ellipse 85% 50% at 50% -10%, rgba(255, 56, 92, 0.20) 0%, rgba(99, 102, 241, 0.10) 45%, rgba(8, 11, 17, 0) 80%)',
      },
      boxShadow: {
        card: '0 20px 50px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'card-hover':
          '0 28px 70px rgba(0, 0, 0, 0.65), 0 0 35px rgba(255, 56, 92, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.18)',
        float:
          '0 30px 65px -12px rgba(0, 0, 0, 0.82), 0 0 0 1px rgba(255, 255, 255, 0.12)',
        luminous:
          '0 14px 38px rgba(255, 56, 92, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
        'luminous-amber': '0 18px 42px rgba(245, 158, 11, 0.26)',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translate3d(0, 0px, 0)' },
          '50%': { transform: 'translate3d(0, -10px, 0)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.95', transform: 'scale(1.06)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s ease-in-out infinite',
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both',
        'float-slow': 'float-slow 5.5s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
