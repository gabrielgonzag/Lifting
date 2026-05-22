/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#303030",
        panel: "#242424",
        panelSoft: "#393939",
        lime: "#B7F34D",
        coral: "#FF6B57",
        sky: "#78D8FF",
      },
      boxShadow: {
        lift: "0 18px 60px rgba(0, 0, 0, 0.28)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
