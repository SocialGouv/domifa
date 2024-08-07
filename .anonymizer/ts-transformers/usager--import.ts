import { main } from "./common/lib"
import {
  randomInt,
  fullName,
  truncateDateToMonthFromString,
} from "./common/data-helpers"

function anonymize(values: Record<string, any>) {
  const usagerImport = JSON.parse(values.import)

  const anonymised = {
    ...usagerImport,
    userId: randomInt(),
    userName: fullName(),
    date: truncateDateToMonthFromString(usagerImport.date),
  }

  values.import = JSON.stringify(anonymised)
}

main(anonymize)
