/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/lib/**/*.{js,jsx,ts,tsx}",
    "./src/hooks/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: "#ed6f1a"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(237, 111, 26, 0.15), 0 20px 60px -20px rgba(237, 111, 26, 0.35)"
      },
      backgroundImage: {
        "brand-radial": "radial-gradient(circle at top, rgba(237, 111, 26, 0.18), transparent 55%)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};