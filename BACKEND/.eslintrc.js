module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:import/recommended", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["import"],
  rules: {
    "import/order": ["error", { groups: ["builtin", "external", "internal"] }],
  },
};
