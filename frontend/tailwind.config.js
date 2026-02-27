/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: '#181d27',
        surface2: '#1f2535',
        border: '#2a3348',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 0 0 rgba(14,165,233,0)' }, '50%': { boxShadow: '0 0 16px 4px rgba(14,165,233,0.25)' } },
      },
      boxShadow: {
        'glow-sky': '0 0 20px rgba(14,165,233,0.3)',
        'glow-teal': '0 0 20px rgba(20,184,166,0.3)',
        'glow-amber': '0 0 20px rgba(245,158,11,0.3)',
      },
    },
  },
  plugins: [],
}
