const execa = require("execa");
const { Soit } = require("./_fr");

Soit("une nouvelle base de donnée", async () => {
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
