/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
        serif: ["'Source Serif 4'", "Lora", "Georgia", "'Times New Roman'", "serif"],
      },
    },
  },
  plugins: [],
};
