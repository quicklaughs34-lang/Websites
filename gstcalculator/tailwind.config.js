/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        premium: '0 24px 80px -24px rgba(15, 23, 42, 0.35)',
      },
      colors: {
        brand: {
          50: '#eefdf9',
          100: '#d4f9ef',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        accent: {
          500: '#fb7185',
          600: '#f43f5e',
        },
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'fade-up': 'fadeUp 0.45s ease-out',
      },
    },
  },
  plugins: [],
}
