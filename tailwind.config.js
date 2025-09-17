/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        black: "#0a0a0a",
        red: {
          50: "#ffe5e5",
          100: "#fbbcbc",
          200: "#f69292",
          300: "#f16868",
          400: "#ec3e3e",
          500: "#e71414",
          600: "#b51010",
          700: "#820c0c",
          800: "#500808",
          900: "#1d0303",
        },
      },
    },
  },
  plugins: [],
}