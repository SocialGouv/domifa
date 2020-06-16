const execa = require("execa");
const { Soit } = require("./_fr");

Soit("une nouvelle base de donnée", async () => {
  const { output } = require("codeceptjs");

  const { stdout } = await execa("mongo", [
    "domifa_test",
    "--eval",
    "db.dropDatabase()",
  ]);
  /*
  output.log("--- 1");
  output.log(stdout);
  output.log(stderr);
  output.log("---");
*/
  {
    const { stdout, stderr } = await execa("mongorestore", [
      "--gzip",
      "--archive=dump_test.gzip",
      "--nsFrom",
      "'domifa.*'",
      "--nsTo",
      "'domifa_test.*'",
    ]);
    /*
    output.log("--- 2");
    output.log(stdout);
    output.log(stderr);
    output.log("---");

    */
  }
});
