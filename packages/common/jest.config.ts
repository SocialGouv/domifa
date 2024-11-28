import type { Config } from "jest";

const jestConfig: Config = {
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  preset: "ts-jest/presets/js-with-ts",
};

export default jestConfig;
