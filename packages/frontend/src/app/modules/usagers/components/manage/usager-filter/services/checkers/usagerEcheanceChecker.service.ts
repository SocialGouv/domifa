import { startOfDay, setHours, addMonths, addDays } from "date-fns";

import { UsagerLight } from "../../../../../../../../_common/model";
import { UsagersFilterCriteria } from "../../UsagersFilterCriteria";

export const usagerEcheanceChecker = {
  check,
};

function check({
  usager,
  echeance,
  refDateNow,
}: {
  usager: UsagerLight;
  refDateNow: Date;
} & Pick<UsagersFilterCriteria, "echeance">): boolean {
  if (echeance) {
    if (usager.decision?.statut !== "VALIDE" || !usager.decision?.dateFin) {
      return false;
    }
    const todayTime = startOfDay(refDateNow).getTime();

    switch (echeance) {
      case "DEPASSEE": {
        const maxDateTime = todayTime;
        const dateFinTime = new Date(usager.decision.dateFin).getTime();
        return dateFinTime <= maxDateTime;
      }
      case "DEUX_MOIS": {
        const minDateTime = todayTime;
        const maxDateTime = setHours(
          addMonths(startOfDay(refDateNow), 2),
          0
        ).getTime();

        const dateFinTime = new Date(usager.decision.dateFin).getTime();
        return dateFinTime <= maxDateTime && dateFinTime >= minDateTime;
      }
      case "DEUX_SEMAINES": {
        const minDateTime = todayTime;
        const maxDateTime = addDays(startOfDay(refDateNow), 14).getTime();
        const dateFinTime = new Date(usager.decision.dateFin).getTime();
        return dateFinTime <= maxDateTime && dateFinTime >= minDateTime;
      }
      default:
        return true;
    }
  }
  return true;
}
