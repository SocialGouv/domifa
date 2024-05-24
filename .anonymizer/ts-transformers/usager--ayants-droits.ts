import { dumpLine, main } from "./common/lib"
import {
  truncateDateToMonthFromString,
  firstName,
  lastName,
} from "./common/data-helpers"


function anonymize(line: Record<string, any>) {
  const ayantsDroits = JSON.parse(line.ayantsDroits.d)

  const anonymisedAyantsDroits = ayantsDroits.map((ayantDroit: any) => {
    return {
      ...ayantDroit,
      prenom: firstName(),
      nom: lastName(),
      dateNaissance: truncateDateToMonthFromString(ayantDroit.dateNaissance),
    }
  })

  line.ayantsDroits.d = JSON.stringify(anonymisedAyantsDroits)
  dumpLine(line)
}

main(anonymize)
