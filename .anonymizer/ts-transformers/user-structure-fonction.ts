import { main } from "./common/lib"
import { fromList } from "./common/data-helpers"

const stdout = process.stdout

function anonymize(line: Record<string, any>) {
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
  stdout.write(JSON.stringify(line) + "\n")
}

main(anonymize)
