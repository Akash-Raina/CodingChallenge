/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5', // Indigo
        secondary: '#f9fafb', // Gray
        accent: '#10b981', // Green
        danger: '#ef4444', // Red
        background: '#f3f4f6', // Light Gray
      },
    },
  },
  plugins: [],
}

