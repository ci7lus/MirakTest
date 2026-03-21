require("@rushstack/eslint-patch/modern-module-resolution")

module.exports = {
  root: true,
  extends: ["@ci7lus/eslint-config"],
  parserOptions: {
    project: ["./tsconfig.eslint.json"],
  },
  plugins: ["classnames"],
  rules: {
    "classnames/prefer-classnames-function": [
      "error",
      { functionName: "clsx" },
    ],
  },
}
