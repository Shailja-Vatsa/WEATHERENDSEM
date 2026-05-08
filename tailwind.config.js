/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        background: {
          light: "#f8fafc",
          dark: "#0f172a"
        },
        surface: {
          light: "#ffffff",
          dark: "#1e293b"
        }
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}
