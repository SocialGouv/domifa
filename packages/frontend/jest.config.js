module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
    "^app/(.*)$": "<rootDir>/src/app/$1",
    "^assets/(.*)$": "<rootDir>/src/assets/$1",
    "^environments/(.*)$": "<rootDir>/src/environments/$1",
    "^intl-tel-input/data$":
      "<rootDir>/node_modules/intl-tel-input/dist/js/data.mjs",
    "^intl-tel-input$":
      "<rootDir>/node_modules/intl-tel-input/dist/js/intlTelInput.mjs",
  },
  transformIgnorePatterns: [
    String.raw`node_modules/(?!.*(\.mjs$|uuid|@edugouvfr/ngx-dsfr|intl-tel-input|google-libphonenumber|@angular/common/locales))`,
  ],
};
