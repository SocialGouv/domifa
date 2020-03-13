module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/src/tsconfig.spec.json",
      stringifyContentPathRegex: "\\.html$",
      astTransformers: [
        "./node_modules/jest-preset-angular/build/InlineFilesTransformer",
        "./node_modules/jest-preset-angular/build/StripStylesTransformer"
      ]
    }
  },
  preset: "jest-preset-angular",
  snapshotSerializers: [
    "./node_modules/jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js",
    "./node_modules/jest-preset-angular/build/AngularSnapshotSerializer.js",
    "./node_modules/jest-preset-angular/build/HTMLCommentSerializer.js"
  ],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png)$": "<rootDir>/__mocks__/image.js",
    "^@lib/(.*)$": "<rootDir>/src/lib/$1"
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupJest.ts"]
};
