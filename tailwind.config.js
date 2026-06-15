/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          deal: '#7c3aed',
          episode: '#1d4ed8',
          reminder: '#b45309',
          script: '#be185d',
          filming: '#1d4ed8',
          edit: '#0369a1',
          publish: '#15803d',
        }
      }
    },
  },
  plugins: [],
}
