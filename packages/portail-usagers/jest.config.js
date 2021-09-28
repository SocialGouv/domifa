require("jest-preset-angular/ngcc-jest-processor");

module.exports = {
  globals: {
    "ts-jest": {
      stringifyContentPathRegex: "\\.html$",
      tsconfig: "<rootDir>/src/tsconfig.spec.json",
    },
  },
  moduleFileExtensions: ["ts", "html", "js", "tsx", "json"],
  moduleNameMapper: {
    "^app/(.*)$": "<rootDir>/src/app/$1",
    "^assets/(.*)$": "<rootDir>/src/assets/$1",
    "^environments/(.*)$": "<rootDir>/src/environments/$1",
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/src/setup-jest.ts"],
  snapshotSerializers: [
    "jest-preset-angular/build/serializers/no-ng-attributes",
    "jest-preset-angular/build/serializers/ng-snapshot",
    "jest-preset-angular/build/serializers/html-comment",
  ],
  transform: {
    "^.+\\.(js|ts|tsx|html)$": "jest-preset-angular",
  },
  transformIgnorePatterns: ["node_modules/(?!@ngrx)"],
};
