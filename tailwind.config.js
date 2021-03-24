module.exports = {
  purge: {
    enabled: process.env.NODE_ENV === "production",
    mode: "all",
    content: [
      "./*.html",
      "./src/**/*.ts",
      "./src/**/*.tsx",
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
