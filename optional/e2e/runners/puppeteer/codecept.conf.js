const envPath = require("path").join(
  process.cwd(),
  "../../../../packages/backend/.tests.env"
);
require("dotenv").config({ path: envPath });

exports.config = {
  output: "./output",
  helpers: {
    Puppeteer: {
      chrome: {
        args: process.env.CI
          ? ["--no-sandbox", "--disable-setuid-sandbox"]
          : ["--window-size=1080,1080"],
        defaultViewport: {
          width: 1080,
          height: 1080,
        },

        executablePath: process.env.CI && process.env.CHROME_PATH,
        headless: process.env.CI
          ? true
          : process.env.CODECEPT_HEADED
          ? false
          : true,
      },
      restart: false,
      show: true,
      url: "http://localhost:4200",
    },
  },
  include: {
    I: "./steps_file.js",
  },
  mocha: {},
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
  },
  tests: "./specs/*_test.js",
  name: "domifa",
};
