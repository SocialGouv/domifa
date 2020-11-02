const execa = require("execa");

const { Soit } = require("./_fr");

Soit("une nouvelle base de donnée", async () => {
  const { output } = require("codeceptjs");

  const test1 = await execa("mongo", [
    "domifa_tests",
    "--eval",
    "db.runCommand( { dropAllUsersFromDatabase: 1, writeConcern: { w: 'majority' } } )",
  ]);

  output.log(test1.stdout);

  const test2 = await execa("mongo", [
    "domifa_tests",
    "--eval",
    "db.dropDatabase()",
  ]);

  output.log(test2.stdout);

  const test3 = await execa("sleep", ["2"]);

  const test4 = await execa("mongo", [
    "domifa_tests",
    "--eval",
    "db.createUser({user:'test', pwd:'test', roles:[{role:'readWrite', db:'domifa_tests'}] });",
  ]);

  output.log(test4.stdout);

  await execa("sleep", ["2"]);

  console.log(require("path").join(process.cwd(), "../../../../dump_tests.gz"));

  const test5 = await execa("mongorestore", [
    "--archive=" +
      require("path").join(process.cwd(), "../../../../dump_tests.gz"),
  ]);

  console.log(test5.stderr);
});
