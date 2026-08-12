module.exports = {
  collectCoverageFrom: ["src/*.{ts}", "src/**/**.ts"],
  preset: "ts-jest",
  testEnvironment: "node",
  // Suite differentielle : elle exige une base Postgres dediee, elle se lance
  // par `pnpm test:differential`. Voir src/usagers/utils/tests/differential.
  testPathIgnorePatterns: ["/node_modules/", "\\.differential\\.spec\\.ts$"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        isolatedModules: true,
      },
    ],
  },
};
