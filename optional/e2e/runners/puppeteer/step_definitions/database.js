const execa = require("execa");
const path = require("path");

const { Soit } = require("./_fr");

const rootPath = path.join(__dirname, '../../../../../')

Soit("une nouvelle base de donnée", async () => {
  console.info(`------------------------------------------------`)
  const { output } = require("codeceptjs");
  {
    // restore POSTGRES DB
    const scriptPath = path.join(rootPath, process.env.DOMIFA_2E2_RESTORE_DATABASES_SCRIPT || '_scripts/db/restore-database-docker.sh')
    const scriptArgs = ['--db=test'];

    console.warn(`RUN POSTGRES RESET SCRIPT with args "${scriptArgs}": ${scriptPath}`)

    output.log(await execa(scriptPath, [
      scriptArgs
    ]));
  }
  // TODO apply migrations here?
  {
    // wait 2s (est-ce utile?)
    output.log(await execa("sleep", ["2"]));
  }

  console.info(`------------------------------------------------`)
});
