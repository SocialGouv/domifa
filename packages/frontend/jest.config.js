module.exports = {
  "preset": "jest-preset-angular",
  "setupFilesAfterEnv": ["./src/setupJest.ts"],
  globals: {
    'ts-jest': {
      tsConfig: './src/tsconfig.spec.json'
    }
  }
};
