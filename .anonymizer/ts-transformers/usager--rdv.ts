import { main } from "./common/lib"
import {
  truncateDateToMonthFromString,
  randomInt,
  fullName,
} from "./common/data-helpers"

function anonymize(values: Record<string, any>) {
  const rdv = JSON.parse(values.rdv)

  const anonymised = {
    ...rdv,
    userId: randomInt(),
    userName: fullName(),
    dateRdv: truncateDateToMonthFromString(rdv.dateRdv),
  }

  values.rdv = JSON.stringify(anonymised)
}

main(["rdv"], anonymize)
