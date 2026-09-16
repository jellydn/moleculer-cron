module.exports = {
  env: {
    es2021: true,
    jest: true,
    node: true
  },
  extends: ["eslint:recommended"],
  ignorePatterns: ["coverage/"],
  parserOptions: {
    ecmaVersion: 2021
  }
};
