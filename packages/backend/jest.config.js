module.exports = {
  collectCoverageFrom: ["src/*.{ts}", "src/**/**.ts"],
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ['./jest.setup.ts'],
};
