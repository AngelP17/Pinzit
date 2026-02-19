declare const _default: {
    content: string[];
    theme: {
        extend: {
            colors: {
                surface: {
                    900: string;
                    800: string;
                    700: string;
                    600: string;
                };
                pass: string;
                fail: string;
                skip: string;
            };
            boxShadow: {
                panel: string;
            };
            keyframes: {
                pulseSoft: {
                    '0%, 100%': {
                        opacity: string;
                    };
                    '50%': {
                        opacity: string;
                    };
                };
            };
            animation: {
                pulseSoft: string;
            };
        };
    };
    plugins: any[];
};
export default _default;
