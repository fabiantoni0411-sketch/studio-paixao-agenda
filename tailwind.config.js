/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: "#fff0f5",
          100: "#ffe0ec",
          200: "#ffc6de",
          400: "#f6a0c4",
          500: "#e83e8c",
          600: "#d62a76",
          700: "#b0185c",
          900: "#3a1c28",
        },
        whatsapp: {
          DEFAULT: "#25D366",
          dark: "#128C7E",
        },
      },
      fontFamily: {
        title: ["var(--font-title)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};
