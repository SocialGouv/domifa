import { main } from "./common/lib"
import {
  number,
  fullName,
  truncateDateToMonthFromString,
  uuid,
  firstName,
  lastName,
} from "./common/data-helpers"

const stdout = process.stdout

function anonymize(line: Record<string, any>) {
  const ayantsDroits = JSON.parse(line.ayantsDroits.d)

  if (!ayantsDroits) {
    stdout.write(JSON.stringify(line) + "\n")
    return
  }

  const anonymisedAyantsDroits = ayantsDroits.map((ayantDroit: any) => {
    return {
      ...ayantDroit,
      prenom: firstName(),
      nom: lastName(),
      dateNaissance: truncateDateToMonthFromString(ayantDroit.dateNaissance),
    }
  })

  line.ayantsDroits.d = JSON.stringify(anonymisedAyantsDroits)
  stdout.write(JSON.stringify(line) + "\n")
}

main(anonymize)
