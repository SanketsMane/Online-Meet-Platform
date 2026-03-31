/** @type {import('tailwindcss').Config} */
//Sanket v2.0 - Tailwind config for admin panel — content: [] means no purging (all utilities included)
module.exports = {
    content: ['./public/views/admin.html'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Outfit', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#f5f7ff',
                    100: '#ebf0fe',
                    200: '#ced9fd',
                    300: '#b1c2fc',
                    400: '#7695fa',
                    500: '#3b68f8',
                    600: '#355de0',
                    700: '#2c4ebb',
                    800: '#233e95',
                    900: '#1d337a',
                },
                slate: { 900: '#0f172a', 800: '#1e293b', 700: '#334155' },
                google: {
                    blue: '#1a73e8',
                    blueHover: '#174ea6',
                    red: '#ea4335',
                    green: '#34a853',
                    yellow: '#fbbc04',
                },
            },
        },
    },
    plugins: [],
};
