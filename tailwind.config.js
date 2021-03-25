module.exports = {
  purge: {
    enabled: process.env.NODE_ENV === "production",
    mode: "all",
    content: [
      "./index.html",
      "./src/**/*.{ts,tsx,scss}",
      "node_modules/react-toastify/dist/ReactToastify.css",
    ],
    whitelist: [],
    whitelistPatterns: [],
  },
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  darkMode: "media",
  plugins: [
    require("tailwindcss-textshadow"),
    require("@tailwindcss/custom-forms"),
  ],
}
