#!/usr/bin/env -S ./node_modules/.bin/tsx

import { main } from "./lib";
import { fromList } from "./data-helpers";

const stdout = process.stdout
const stderr = process.stderr

function anonymize(line: Record<string, any>) {

  const toto = fromList([
    "Agent administratif",
    "Agent d'accueil",
    "Educateur Spécialisé",
    "Président",
    "Responsable de service",
    "Travailleur social",
    null,
    null,
    null,
  ])

  line.fonction.d = toto
  stderr.write(JSON.stringify(line) + "\n");
  stdout.write(JSON.stringify(line) + "\n");
}

main(anonymize)
