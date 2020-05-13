const execa = require("execa");

Given("a clean test database", async () => {
  const { output } = require("codeceptjs");

  await execa("mongo", ["domifa_test", "--eval", "db.dropDatabase()"]);

  const { stdout } = execa(
    "mongorestore",
    "--gzip",
    "--archive=dump_test.gzip",
    "--nsFrom",
    "domifa.*",
    "--nsTo",
    "domifa_test.*"
  );

  stdout && output.log("  #[" + stdout + "]");
});
