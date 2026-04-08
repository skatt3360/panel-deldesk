/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cdv: {
          blue: '#003087',
          'blue-dark': '#002060',
          'blue-light': '#0044b8',
          gold: '#FFB81C',
          'gold-dark': '#e6a419',
          'gold-light': '#ffc94d',
        },
      },
    },
  },
  plugins: [],
}
