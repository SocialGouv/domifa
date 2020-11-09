const execa = require("execa");
const path = require("path");

const { Soit } = require("./_fr");

const rootPath = path.join(__dirname, "../../../../../");

Soit("une nouvelle base de donnée", async () => {
  console.info(`------------------------------------------------`);
  const { output } = require("codeceptjs");
  {
    // restore POSTGRES DB
    const scriptPath = path.join(
      rootPath,
      process.env.DOMIFA_POSTGRES_RESET_SCRIPT
    );
    const scriptArgs = process.env.DOMIFA_POSTGRES_RESET_SCRIPT_ARGS;

    console.warn(
      `RUN RESET POSTGRES SCRIPT with args "${scriptArgs}": ${scriptPath}`
    );

    output.log(await execa(scriptPath, [scriptArgs]));
  }
  {
    // restore MONGO DB
    const scriptPath = path.join(
      rootPath,
      process.env.DOMIFA_MONGO_RESET_SCRIPT
    );
    const scriptArgs = process.env.DOMIFA_MONGO_RESET_SCRIPT_ARGS;

    console.warn(
      `RUN RESET MONGO SCRIPT with args "${scriptArgs}": ${scriptPath}`
    );

    output.log(await execa(scriptPath, [scriptArgs]));
  }
  // TODO apply migrations here?
  {
    // wait 2s (est-ce utile?)
    output.log(await execa("sleep", ["2"]));
  }

  console.info(`------------------------------------------------`);
});
