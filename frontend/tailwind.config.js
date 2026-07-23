/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12233F",
        ink2: "#1B3358",
        sand: "#F1E6D2",
        sandDeep: "#E4D2B2",
        gold: "#E3A23C",
        clay: "#C1440E",
        lagoon: "#1D6F6F",
        ink900: "#0B1626",
        cream: "#FAF6EE",
        green: "#2F6B4F",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Work Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
