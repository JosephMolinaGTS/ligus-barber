/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta LIGUS BARBER — colores de marca
        barber: {
          black: '#000000',
          charcoal: '#1A1A1A',
          dark: '#2B2B2B',
          blue: '#004B7A',
          'blue-light': '#00517F',
          red: '#9B0000',
          'red-dark': '#B00000',
          white: '#FFFFFF',
          gray: '#CFCFCF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
