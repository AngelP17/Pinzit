import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          0: '#0c1118',
          1: '#11171f',
          2: '#161d27',
          3: '#1c2532',
        },
        ink: {
          0: '#f5f1e8',
          1: '#d6d2c4',
          2: '#8b8576',
        },
        signal: {
          DEFAULT: '#f5b04a',
          soft: 'rgba(245,176,74,0.18)',
          line: 'rgba(245,176,74,0.45)',
        },
        // verdict semantics (kept restrained, not used as brand)
        pass: '#6dd58c',
        fail: '#ff6a6a',
        skip: '#f5b04a',
        // legacy aliases referenced by older components
        surface: {
          900: '#0c1118',
          800: '#11171f',
          700: '#161d27',
          600: 'rgba(245,241,232,0.10)',
        },
        hero: {
          sky: { deep: '#0c1118', mid: '#11171f' },
        },
      },
      fontFamily: {
        display: ['"Geist"', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        sans: ['"Geist"', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        panel: '0 18px 48px -16px rgba(0,0,0,0.55)',
        glow: '0 0 0 1px rgba(245,176,74,0.45), 0 12px 30px -10px rgba(245,176,74,0.35)',
      },
      keyframes: {
        marquee: {
          '0%':  { transform: 'translateX(0)' },
          '100%':{ transform: 'translateX(-50%)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.72' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        sweepLine: {
          '0%':   { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        marquee:    'marquee 38s linear infinite',
        pulseSoft:  'pulseSoft 1.8s ease-in-out infinite',
        fadeUp:     'fadeUp .7s ease forwards',
        sweepLine:  'sweepLine .9s ease-out forwards',
      },
    },
  },
  plugins: [],
} satisfies Config;
