import { main } from "./common/lib"
import {
  number,
  fullName,
  truncateDateToMonth as truncateDateToMonthFromString,
  uuid,
} from "./common/data-helpers"

const stdout = process.stdout

function anonymize(line: Record<string, any>) {
  const historique = JSON.parse(line.historique.d)

  if (!historique) {
    stdout.write(JSON.stringify(line) + "\n")
    return
  }

  const anonymisedHistorique = historique.map((decision: any) => {
    return {
      ...decision,
      motifDetails: null, // TODO: incorrect? rather anonymize `motif` field?
      orientationDetails: null,
      userName: fullName(),
      userId: number(),
      uuid: uuid(),
      dateDecision:
        decision.dateDecision ??
        truncateDateToMonthFromString(decision.dateDecision),
      // TODO anonymize other fields: dateDebut, dateFin, dateDecision
    }
  })

  line.historique.d = JSON.stringify(anonymisedHistorique)
  stdout.write(JSON.stringify(line) + "\n")
}

main(anonymize)
