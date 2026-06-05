/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{tsx,ts,jsx,js}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F8CFF',
          50:  '#EFF5FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#4F8CFF',
          600: '#3B82F6',
          700: '#2563EB',
          800: '#1D4ED8',
          900: '#1E40AF',
        },
        secondary: {
          DEFAULT: '#7B61FF',
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#7B61FF',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        accent: {
          DEFAULT: '#4DE2E2',
          50:  '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#4DE2E2',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        xl:  '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.5rem',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(79,140,255,0.12)',
        'glass-md': '0 12px 40px rgba(79,140,255,0.18)',
        'glass-lg': '0 20px 60px rgba(79,140,255,0.24)',
        'primary-glow': '0 0 20px rgba(79,140,255,0.4)',
        'secondary-glow': '0 0 20px rgba(123,97,255,0.4)',
        'card-hover': '0 16px 48px rgba(79,140,255,0.22)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      animation: {
        'fade-in':       'fadeIn 0.4s ease forwards',
        'slide-up':      'slideUp 0.4s ease forwards',
        'slide-down':    'slideDown 0.3s ease forwards',
        'slide-right':   'slideRight 0.3s ease forwards',
        'scale-in':      'scaleIn 0.3s ease forwards',
        'pulse-glow':    'pulseGlow 2s ease-in-out infinite',
        'shimmer':       'shimmer 1.5s infinite linear',
        'bounce-light':  'bounceLight 0.6s ease',
        'gradient-move': 'gradientMove 8s ease infinite',
        'spin-slow':     'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(79,140,255,0.3)' },
          '50%':       { boxShadow: '0 0 30px rgba(79,140,255,0.6)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceLight: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-6px)' },
        },
        gradientMove: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':   'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #4F8CFF 0%, #7B61FF 100%)',
        'gradient-accent':  'linear-gradient(135deg, #4DE2E2 0%, #4F8CFF 100%)',
        'hero-gradient':    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.glass': {
          background:      'rgba(255, 255, 255, 0.12)',
          backdropFilter:  'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border:          '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          background:      'rgba(15, 23, 42, 0.6)',
          backdropFilter:  'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border:          '1px solid rgba(255, 255, 255, 0.08)',
        },
        '.glass-card': {
          background:      'rgba(255, 255, 255, 0.85)',
          backdropFilter:  'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border:          '1px solid rgba(255, 255, 255, 0.6)',
        },
        '.glass-card-dark': {
          background:      'rgba(30, 41, 59, 0.8)',
          backdropFilter:  'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border:          '1px solid rgba(255, 255, 255, 0.06)',
        },
        '.text-gradient': {
          background:              'linear-gradient(135deg, #4F8CFF 0%, #7B61FF 100%)',
          WebkitBackgroundClip:    'text',
          WebkitTextFillColor:     'transparent',
          backgroundClip:          'text',
        },
        '.text-gradient-accent': {
          background:              'linear-gradient(135deg, #4DE2E2 0%, #4F8CFF 100%)',
          WebkitBackgroundClip:    'text',
          WebkitTextFillColor:     'transparent',
          backgroundClip:          'text',
        },
        '.card-hover': {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.card-hover:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 60px rgba(79,140,255,0.2)',
        },
        '.btn-primary': {
          background:  'linear-gradient(135deg, #4F8CFF 0%, #7B61FF 100%)',
          color:       '#ffffff',
          border:      'none',
          cursor:      'pointer',
          transition:  'all 0.3s ease',
        },
        '.btn-primary:hover': {
          transform:   'translateY(-2px)',
          boxShadow:   '0 8px 25px rgba(79,140,255,0.5)',
        },
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#4F8CFF transparent',
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '6px',
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          background:   '#4F8CFF',
          borderRadius: '3px',
        },
      });
    },
  ],
};
