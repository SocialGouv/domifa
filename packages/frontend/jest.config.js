module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/src/tsconfig.spec.json",
      stringifyContentPathRegex: "\\.html$",
      astTransformers: [
        "./node_modules/jest-preset-angular/build/InlineFilesTransformer",
        "./node_modules/jest-preset-angular/build/StripStylesTransformer",
      ],
    },
  },

  transform: {
    "^.+\\.(ts|js|html|tsx)$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "html", "js", "json"],
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
    "^app/(.*)$": "<rootDir>/src/app/$1",
    "^assets/(.*)$": "<rootDir>/src/assets/$1",
    "^environments/(.*)$": "<rootDir>/src/environments/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!@ngrx)",
    "node_modules/(?!countup.js)",
    "../node_modules/(?!countup.js)",
  ],
  setupFilesAfterEnv: ["<rootDir>/src/setupJest.ts"],
  snapshotSerializers: [
    "jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js",
    "jest-preset-angular/build/AngularSnapshotSerializer.js",
    "jest-preset-angular/build/HTMLCommentSerializer.js",
  ],
};
