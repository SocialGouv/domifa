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
  // file-type and its ESM dependencies
  "file-type",
  "strtok3",
  "token-types",
  "uint8array-extras",
  "@tokenizer/inflate",
  "@borewit/text-codec",
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
