import { main, dumpLine } from "./common/lib"
import {
  randomInt,
  fullName,
  truncateDateToMonthFromString,
} from "./common/data-helpers"

function anonymize(line: Record<string, any>) {
  const usagerImport = JSON.parse(line.import.d)

  const anonymisedImport = {
    ...usagerImport,
    userId: randomInt(),
    userName: fullName(),
    date: truncateDateToMonthFromString(usagerImport.date),
  }

  line.import.d = JSON.stringify(anonymisedImport)
  dumpLine(line)
}

main(anonymize)
