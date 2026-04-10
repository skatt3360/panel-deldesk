/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans:    ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // ─── CDV Brand (true identity) ──────────────────────────────────────────
        cdv: {
          // Purple — Courage
          purple:        '#8B43D6',
          'purple-dark': '#6B2D8B',
          'purple-deep': '#3D1566',
          'purple-light':'#C49EE8',
          'purple-glow': 'rgba(139,67,214,0.25)',
          // Orange — Creativity
          orange:        '#FF6900',
          'orange-dark': '#CC5500',
          'orange-light':'#FFD4B3',
          'orange-glow': 'rgba(255,105,0,0.22)',
          // Green — Cooperation
          green:         '#2DB87A',
          'green-dark':  '#1E8A5A',
          'green-light': '#A8F0D0',
          'green-glow':  'rgba(45,184,122,0.2)',
          // Legacy gold (kept for backwards compat)
          gold:          '#FFB81C',
          'gold-dark':   '#c98f00',
          // Blues (legacy, kept for calendar etc.)
          blue:          '#003087',
          'blue-dark':   '#001f5a',
          'blue-mid':    '#004ab5',
          'blue-light':  '#e8effe',
        },
        // ─── Surfaces (dark theme) ───────────────────────────────────────────────
        surface: {
          DEFAULT: '#F5F7FA',  // light fallback
          card:    '#FFFFFF',
          border:  '#E8ECF2',
          // dark variants used via bg-[#] directly
        },
        ink: {
          DEFAULT: '#111827',
          muted:   '#6B7280',
          faint:   '#9CA3AF',
        },
      },
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
        'card-hover':'0 4px 8px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.07)',
        sidebar:    '4px 0 24px rgba(0,0,0,0.25)',
        dropdown:   '0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
        purple:     '0 0 20px rgba(139,67,214,0.35)',
        orange:     '0 0 20px rgba(255,105,0,0.35)',
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(160deg, #0A0812 0%, #120B1E 50%, #0E0A18 100%)',
        'purple-gradient':  'linear-gradient(135deg, #8B43D6 0%, #6B2D8B 100%)',
        'orange-gradient':  'linear-gradient(135deg, #FF6900 0%, #FF8C00 100%)',
        'green-gradient':   'linear-gradient(135deg, #2DB87A 0%, #1E8A5A 100%)',
        'hero-gradient':    'linear-gradient(135deg, #1A0A2E 0%, #0F0718 50%, #1A0820 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%':   { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-up-sm': {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'blur-in': {
          '0%':   { opacity: '0', filter: 'blur(8px)', transform: 'scale(1.02)' },
          '100%': { opacity: '1', filter: 'blur(0px)', transform: 'scale(1)' },
        },
        'pulse-dot': {
          '0%, 100%': { transform: 'scale(1)',   opacity: '1' },
          '50%':       { transform: 'scale(1.5)', opacity: '0.6' },
        },
        'rotate-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        'line-grow': {
          '0%':   { transform: 'scaleX(0)', opacity: '0' },
          '100%': { transform: 'scaleX(1)', opacity: '1' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'bg-shift': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        'fade-up':     'fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in':     'fade-in 0.35s ease both',
        'slide-in':    'slide-in 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'slide-up-sm': 'slide-up-sm 0.25s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in':    'scale-in 0.22s cubic-bezier(0.22,1,0.36,1) both',
        'blur-in':     'blur-in 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'pulse-dot':   'pulse-dot 2s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        'float':       'float 4s ease-in-out infinite',
        'line-grow':   'line-grow 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'shimmer':     'shimmer 2.5s linear infinite',
        'bg-shift':    'bg-shift 8s ease infinite',
      },
    },
  },
  plugins: [],
}
