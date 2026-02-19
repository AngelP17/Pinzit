export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
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
            keyframes: {
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.72' },
                },
            },
            animation: {
                pulseSoft: 'pulseSoft 1.8s ease-in-out infinite',
            },
        },
    },
    plugins: [],
};
