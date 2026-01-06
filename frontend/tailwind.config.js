export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#f7f7fb",
        card: "#ffffff",
        accent: "#4f46e5",
      },
      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
