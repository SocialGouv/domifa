module.exports = {
  extends: ["@socialgouv/eslint-config-typescript"],
  env: {
    node: true,
    jest: true,
  },
  parserOptions: {
    project: "./tsconfig.json",
    sourceType: "module",
  },
};
