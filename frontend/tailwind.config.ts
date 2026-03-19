/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1565C0",
          accent: "#00A896"
        }
      }
    }
  },
  plugins: []
};
