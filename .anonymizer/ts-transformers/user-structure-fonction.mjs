#!/usr/bin/env -S node

import { main } from "./lib.mjs";
import { fromList } from "./data-helpers.mjs";

const stdout = process.stdout
const stderr = process.stderr

function anonymize(line) {

  const new_fonction = fromList([
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

  if (new_fonction === null) {
    line.fonction.d = ""
    line.fonction.n = true
  } else {
    line.fonction.d = new_fonction
    line.fonction.n = false
  }
  // stderr.write("Output: " + JSON.stringify(line) + "\n");
  stdout.write(JSON.stringify(line) + "\n");
}

main(anonymize)
