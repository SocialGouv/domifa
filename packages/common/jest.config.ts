import type { Config } from "jest";

const jestConfig: Config = {
  collectCoverage: false,
  coverageReporters: ["cobertura"],
  coverageDirectory: "./coverage/",
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  preset: "ts-jest/presets/js-with-ts",
};

export default jestConfig;
