const execa = require("execa");
const path = require("path");

const { Soit } = require("./_fr");

const rootPath = path.join(__dirname, '../../../../../')

Soit("une nouvelle base de donnée", async () => {
  const { output } = require("codeceptjs");
  {
    // restore POSTGRES DB
    const scriptPath = path.join(rootPath, process.env.DOMIFA_POSTGRES_RESET_SCRIPT)
    const scriptArgs = process.env.DOMIFA_POSTGRES_RESET_SCRIPT_ARGS;

    console.warn(`RUN RESET POSTGRES SCRIPT with args "${scriptArgs}": ${scriptPath}`)

    output.log(await execa(scriptPath, [
      scriptArgs
    ]));
  }
  {
    // restore MONGO DB
    const scriptPath = path.join(rootPath, process.env.DOMIFA_MONGO_RESET_SCRIPT)
    const scriptArgs = process.env.DOMIFA_MONGO_RESET_SCRIPT_ARGS;

    console.warn(`RUN RESET MONGO SCRIPT with args "${scriptArgs}": ${scriptPath}`)

    output.log(await execa(scriptPath, [
      scriptArgs,
    ]));
  }
  // TODO apply migrations here?
  {
    // wait 2s (est-ce utile?)
    output.log(await execa("sleep", ["2"]));
  }

  // const test1 = await execa("mongo", [
  //   "domifa_tests",
  //   "--eval",
  //   "db.runCommand( { dropAllUsersFromDatabase: 1, writeConcern: { w: 'majority' } } )",
  // ]);

  // output.log(test1.stdout);

  // const test2 = await execa("mongo", [
  //   "domifa_tests",
  //   "--eval",
  //   "db.dropDatabase()",
  // ]);

  // output.log(test2.stdout);

  // const test4 = await execa("mongo", [
  //   "domifa_tests",
  //   "--eval",
  //   "db.createUser({user:'test', pwd:'test', roles:[{role:'readWrite', db:'domifa_tests'}] });",
  // ]);

  // output.log(test4.stdout);

  // await execa("sleep", ["2"]);

  // console.log(require("path").join(process.cwd(), "../../../../dump_tests.mongo.gz"));

  // const test5 = await execa("mongorestore", [
  //   "--archive=" +
  //   require("path").join(process.cwd(), "../../../../dump_tests.mongo.gz"),
  // ]);

  // await execa("sleep", ["2"]);

  // output.log(test5.stderr);
});
