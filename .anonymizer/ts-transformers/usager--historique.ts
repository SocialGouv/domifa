import { main } from "./common/lib"
import {
  randomInt,
  fullName,
  truncateDateToMonthFromString,
  uuid,
} from "./common/data-helpers"

function anonymize(values: Record<string, any>) {
  const historique = JSON.parse(values.historique)

  const anonymisedHistorique = historique.map((decision: any) => {
    return {
      ...decision,
      motifDetails: null, // TODO: incorrect? rather anonymize `motif` field?
      orientationDetails: null,
      userName: fullName(),
      userId: randomInt(),
      uuid: uuid(),
      dateDecision:
        truncateDateToMonthFromString(decision.dateDecision),
      // TODO anonymize other fields: dateDebut, dateFin, dateDecision
    }
  })

  values.historique = JSON.stringify(anonymisedHistorique)
}

main(['historique'], anonymize)
