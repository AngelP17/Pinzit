import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        hero: {
          sky: {
            deep: '#071426',
            mid: '#102a43',
          },
        },
        surface: {
          900: '#0a0a0b',
          800: '#141416',
          700: '#1a1a1e',
          600: '#26262b',
        },
        pass: '#22c55e',
        fail: '#ef4444',
        skip: '#f59e0b',
      },
      boxShadow: {
        panel: '0 10px 30px rgba(0,0,0,0.35)',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', '"Avenir Next"', 'sans-serif'],
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.72' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        dash: {
          '0%': { strokeDashoffset: '500' },
          '100%': { strokeDashoffset: '0' },
        },
        heroFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        pulseSoft: 'pulseSoft 1.8s ease-in-out infinite',
        marquee: 'marquee 20s linear infinite',
        fadeUp: 'fadeUp .7s ease forwards',
        heroFloat: 'heroFloat 10s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
