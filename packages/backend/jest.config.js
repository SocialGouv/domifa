module.exports = {
  collectCoverageFrom: ["src/*.{ts}", "src/**/**.ts"],
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        isolatedModules: true,
      },
    ],
  },
};
