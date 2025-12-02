/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6a0dad",
          50: "#f8f1ff",
          100: "#f3e6ff",
          200: "#ede1ff",
          300: "#d6b6ff",
          400: "#c5a2f5",
          500: "#b487ff",
          600: "#6a0dad",
          700: "#5800b5",
          800: "#2b1243",
          900: "#1a062a",
        },
      },
      animation: {
        "fade-in": "fadeIn 1.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
