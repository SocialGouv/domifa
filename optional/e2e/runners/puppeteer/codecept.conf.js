const envPath = require("path").join(process.cwd(), ".env");
require("dotenv").config({ path: envPath });

console.log(process.env.PUPPETEER_CHROME_HEADLESS);
console.log(process.env.CHROME_PATH);
console.log(process.env.PUPPETEER_CHROME_ARGS);
exports.config = {
  output: "./output",
  helpers: {
    Puppeteer: {
      chrome: {
        args: process.env.PUPPETEER_CHROME_ARGS
          ? process.env.PUPPETEER_CHROME_ARGS.split(" ")
          : [],
        defaultViewport: {
          width: 1080,
          height: 1080,
        },
        executablePath:
          process.env.PUPPETEER_EXEC_PATH ||
          (process.env.CI && process.env.PUPPETEER_CHROME_PATH),
        headless:
          process.env.PUPPETEER_CHROME_HEADLESS === "false" ? false : true,
      },
      restart: false,
      show: true,
      url: process.env.DOMIFA_FRONTEND_URL,
    },
  },
  include: {
    I: "./steps_file.js",
  },
  mocha: { bail: true },
  bootstrap: null,
  teardown: null,
  hooks: [],
  gherkin: {
    features: "../../features/**/*.feature",
    steps: ["./step_definitions/database.js", "./step_definitions/global.js"],
  },
  plugins: {
    allure: {},
    screenshotOnFail: {
      enabled: true,
    },
    tryTo: {
      enabled: true,
    },
    retryFailedStep: {
      enabled: true,
      retries: 10,
      minTimeout: 100,
      maxTimeout: 2000,
    }
  },
  tests: "./specs/*_test.js",
  name: "domifa",
};
