// require("jest-preset-angular/ngcc-jest-processor");

module.exports = {
  preset: "jest-preset-angular",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/src/tsconfig.spec.json",
      stringifyContentPathRegex: "\\.html$",
    },
  },
  moduleFileExtensions: ["ts", "html", "js", "tsx", "json"],
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
    "^app/(.*)$": "<rootDir>/src/app/$1",
    "^assets/(.*)$": "<rootDir>/src/assets/$1",
    "^environments/(.*)$": "<rootDir>/src/environments/$1",
  },
  transform: {
    "^.+\\.(js|ts|tsx|html)$": "jest-preset-angular",
  },
  transformIgnorePatterns: ["node_modules/(?!@ngrx" + "|countup.js)"],
  setupFilesAfterEnv: ["<rootDir>/src/setup-jest.ts"],
  snapshotSerializers: [
    "jest-preset-angular/build/serializers/no-ng-attributes",
    "jest-preset-angular/build/serializers/ng-snapshot",
    "jest-preset-angular/build/serializers/html-comment",
  ],
};
