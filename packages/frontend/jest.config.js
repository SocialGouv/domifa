module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
    "^app/(.*)$": "<rootDir>/src/app/$1",
    "^assets/(.*)$": "<rootDir>/src/assets/$1",
    "^environments/(.*)$": "<rootDir>/src/environments/$1",
  },
  transformIgnorePatterns: [
    String.raw`node_modules/(?!.*\.mjs$|uuid|@edugouvfr/ngx-dsfr|intl-tel-input|google-libphonenumber)`,
  ],
};
