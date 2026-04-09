/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        cdv: {
          blue: '#003087',
          'blue-dark': '#001f5a',
          'blue-mid': '#004ab5',
          'blue-light': '#e8effe',
          gold: '#FFB81C',
          'gold-dark': '#c98f00',
          'gold-light': '#fff3cc',
        },
        surface: {
          DEFAULT: '#F5F7FA',
          card: '#FFFFFF',
          border: '#E8ECF2',
        },
        ink: {
          DEFAULT: '#111827',
          muted: '#6B7280',
          faint: '#9CA3AF',
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 8px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.07)',
        'sidebar': '4px 0 24px rgba(0,0,0,0.12)',
        'header': '0 1px 0 #E8ECF2',
        'dropdown': '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(160deg, #001233 0%, #002366 50%, #001a4d 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFB81C 0%, #FF9500 100%)',
        'blue-gradient': 'linear-gradient(135deg, #003087 0%, #004ab5 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-dot': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease both',
        'fade-in': 'fade-in 0.3s ease both',
        'slide-in': 'slide-in 0.3s ease both',
        'scale-in': 'scale-in 0.2s ease both',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
