import type { Config } from "jest";
import { createJsWithTsPreset } from "ts-jest";

// ESM-only dependencies (pulled by sanitize-html) that must be transpiled to CJS
const ESM_PACKAGES = [
  "htmlparser2",
  "domhandler",
  "domutils",
  "domelementtype",
  "dom-serializer",
  "entities",
];

const config: Config = {
  ...createJsWithTsPreset({
    tsconfig: { isolatedModules: true, allowJs: true },
  }),
  collectCoverageFrom: ["src/**/*.ts"],
  transformIgnorePatterns: [
    `node_modules/(?!(\\.pnpm|${ESM_PACKAGES.join("|")})[/@])`,
  ],
};

export default config;
