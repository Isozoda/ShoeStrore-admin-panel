import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          50: '#EDEAFF',
          100: '#DDD9FF',
          200: '#BDB6FF',
          300: '#9C93FF',
          400: '#7B70FF',
          500: '#5B4DFF',
          600: '#4F46E5',
          700: '#3730B8',
          800: '#281F8A',
          900: '#19115D',
        },
        sidebar: {
          light: '#FFFFFF',
          dark: '#1E293B',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideIn: { '0%': { transform: 'translateX(-10px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};

export default config;
