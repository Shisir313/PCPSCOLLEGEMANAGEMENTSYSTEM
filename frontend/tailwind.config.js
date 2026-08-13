/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        pcps: {
          red:         '#CC1122',
          'red-dark':  '#A80E1C',
          'red-light': '#FFF0F2',
          blue:        '#1B4F9B',
          'blue-dark': '#153D7A',
          'blue-mid':  '#2B6CB0',
          'blue-light':'#EBF2FC',
          white:       '#FFFFFF',
          offwhite:    '#F7F8FA',
          border:      '#D1D5DB',
          text:        '#1E293B',
          muted:       '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':      'fadeIn 0.5s ease both',
        'fade-up':      'fadeUp 0.5s ease both',
        'fade-up-slow': 'fadeUp 0.8s ease both',
        'slide-in-left':'slideInLeft 0.5s ease both',
        'slide-in-right':'slideInRight 0.5s ease both',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':    'spin 8s linear infinite',
        'bounce-slow':  'bounce 2s infinite',
        'float':        'float 3s ease-in-out infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'scale-in':     'scaleIn 0.3s ease both',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'hero-gradient':    'linear-gradient(135deg, #1B4F9B 0%, #153D7A 40%, #CC1122 100%)',
        'card-gradient':    'linear-gradient(135deg, #1B4F9B 0%, #2B6CB0 100%)',
        'red-gradient':     'linear-gradient(135deg, #CC1122 0%, #A80E1C 100%)',
        'glass-gradient':   'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'glow-red':  '0 0 20px rgba(204,17,34,0.35)',
        'glow-blue': '0 0 20px rgba(27,79,155,0.35)',
        'card':      '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
        'card-hover':'0 10px 25px -5px rgba(27,79,155,0.2), 0 4px 6px -2px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
