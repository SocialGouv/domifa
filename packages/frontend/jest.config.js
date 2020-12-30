module.exports = {
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/src/tsconfig.spec.json",
      stringifyContentPathRegex: "\\.html$",
      astTransformers: {
        before: [
          "./node_modules/jest-preset-angular/build/InlineFilesTransformer",
          "./node_modules/jest-preset-angular/build/StripStylesTransformer",
        ],
      },
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
    "^.+\\.(js|ts|tsx|html)$": "ts-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!@ngrx" + "|countup.js)"],
  setupFilesAfterEnv: ["<rootDir>/src/setupJest.ts"],
  snapshotSerializers: [
    "jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js",
    "jest-preset-angular/build/AngularSnapshotSerializer.js",
    "jest-preset-angular/build/HTMLCommentSerializer.js",
  ],
};
