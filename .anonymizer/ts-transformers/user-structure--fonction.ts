import { main } from "./common/lib"
import { fromList } from "./common/data-helpers"

function anonymize(values: Record<string, any>) {
  const new_fonction = fromList([
    "Agent administratif",
    "Agent d'accueil",
    "Educateur Spécialisé",
    "Président",
    "Responsable de service",
    "Travailleur social",
  ])

  values.fonction = new_fonction
}

main(["fonction"], anonymize)
