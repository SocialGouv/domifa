import { Command } from "commander";
import { rmdirSync } from "fs";
import { convertFromDirectory } from "joi-to-typescript";
import { appLogger } from "./util";

(async () => {
  const program = new Command();
  // program.option('-d, --debug', 'output extra debugging');

  await program
    .command("joi-generate-interfaces")
    .alias("joi")
    .description("create ts types from joi schema definitions")
    .action(async function (options) {
      await joiToTypecript();
    });

  await program.parseAsync(process.argv);

  // if (program.debug) console.log(program.opts());

  console.log("Exit CLI");
  process.exit(0);
})();

async function joiToTypecript() {
  const typeOutputDirectory =
    "./src/usagers/controllers/import/schema-generated-model";
  await rmdirSync(typeOutputDirectory, {
    recursive: true,
  });

  try {
    await convertFromDirectory({
      schemaDirectory: "./src/usagers/controllers/import/schema",
      typeOutputDirectory,
      debug: true,
      schemaFileSuffix: "Schema.joi",
      // pour l'instant, obliger de lister tous les tests!!!
      // https://github.com/mrjono1/joi-to-typescript/issues/81
      ignoreFiles: [
        "UsagersImportCiviliteSchema.joi.test.ts",
        "UsagersImportUsagerSchema.joi.test.ts",
        "DateFrUTCSchema.joi.test.ts",
      ],
    });
  } catch (error) {
    console.log(error);
    appLogger.error(`[${__filename}] Error running joiToTypecript`, error);
  } finally {
    process.exit(0);
  }
}
