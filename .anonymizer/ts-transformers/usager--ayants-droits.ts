import { main } from "./common/lib"
import {
  truncateDateToMonthFromString,
  firstName,
  lastName,
} from "./common/data-helpers"


function anonymize(values: Record<string, any>) {
  const ayantsDroits = JSON.parse(values.ayantsDroits)

  const anonymisedAyantsDroits = ayantsDroits.map((ayantDroit: any) => {
    return {
      ...ayantDroit,
      prenom: firstName(),
      nom: lastName(),
      dateNaissance: truncateDateToMonthFromString(ayantDroit.dateNaissance),
    }
  })

  values.ayantsDroits = JSON.stringify(anonymisedAyantsDroits)
}

main(["ayantsDroits"], anonymize)
