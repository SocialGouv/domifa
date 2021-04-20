import { Command } from "commander";

(async () => {
  // NOTE @toub (2021-04-07) : composant initialement introduit pour joi, plus utilisémais va être le point d'entrée pour les migrations et l'anonymisation, donc on le conserve
  const program = new Command();

  await program.parseAsync(process.argv);

  console.log("Exit CLI");
  process.exit(0);
})();
