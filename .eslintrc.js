require("@rushstack/eslint-patch/modern-module-resolution")

module.exports = {
  extends: ["@ci7lus/eslint-config"],
  parserOptions: {
    project: ["./tsconfig.eslint.json"],
  },
}
