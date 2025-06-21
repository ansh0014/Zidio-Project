/** @type {import('tailwindcss').Config} */
export default {
  // 🧠 Only scan necessary files — avoid excess paths
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],

  darkMode: "class",

  theme: {
    extend: {
      // 🎨 Use only the shades you need
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },

      // 🕺 Custom animations (kept minimal for speed)
      animation: {
        "bounce-slow": "bounce 3s infinite",
        "pulse-slow": "pulse 4s infinite",
      },
    },
  },

  // 🚀 Keep plugins list minimal
  plugins: [],
}
