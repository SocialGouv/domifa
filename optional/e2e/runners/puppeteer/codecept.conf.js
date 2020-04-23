exports.config = {
  output: "./output",
  helpers: {
    Puppeteer: {
      chrome: {
        args: process.env.CI
          ? ["--no-sandbox", "--disable-setuid-sandbox"]
          : ["--window-size=1024,1024"],
        defaultViewport: {
          width: 1024,
          height: 1024,
        },
        executablePath: process.env.CI && "/usr/bin/google-chrome-stable",
        headless: process.env.CI
          ? true
          : process.env.CODECEPT_HEADED
          ? false
          : true,
      },
      restart: false,
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
    features: "../../features/*.feature",
    steps: ["./step_definitions/global.js"],
  },
  plugins: {
    screenshotOnFail: {
      enabled: true,
    },
  },
  tests: "./specs/*_test.js",
  name: "domifa",
};
