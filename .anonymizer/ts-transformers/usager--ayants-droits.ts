import { main } from "./common/lib"
import {
  truncateDateToMonthFromString,
  firstName,
  lastName,
} from "./common/data-helpers"

function anonymize(values: Record<string, any>) {
  const ayantsDroits = JSON.parse(values.ayantsDroits)

  const anonymised = ayantsDroits.map((ayantDroit: any) => {
    return {
      ...ayantDroit,
      prenom: firstName(),
      nom: lastName(),
      dateNaissance: truncateDateToMonthFromString(ayantDroit.dateNaissance),
    }
  })

  values.ayantsDroits = JSON.stringify(anonymised)
}

main(anonymize)
