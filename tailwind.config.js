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
  theme: {
    cursor: {
      none: "none",
    },
    extend: {
      animation: {
        "ping-once":
          "ping 1s cubic-bezier(0, 0, 0.2, 1), hidden 1s linear 1s infinite",
      },
      keyframes: {
        hidden: {
          "0%, 100%": {
            opacity: 0,
          },
        },
      },
    },
  },
}
