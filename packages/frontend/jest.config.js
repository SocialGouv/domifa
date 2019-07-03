module.exports = {
  collectCoverageFrom: ["src/app/**/*.{html,ts}"],
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["./src/setupJest.ts"],
  testEnvironment: "jsDom"
};
