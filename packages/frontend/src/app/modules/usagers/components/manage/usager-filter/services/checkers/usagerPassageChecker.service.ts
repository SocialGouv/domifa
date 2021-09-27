import { startOfDay, subMonths } from "date-fns";

import { UsagerLight } from "../../../../../../../../_common/model";
import { UsagersFilterCriteria } from "../../UsagersFilterCriteria";

export const usagerPassageChecker = {
  check,
};

function check({
  usager,
  passage,
  refDateNow,
}: {
  usager: UsagerLight;
  refDateNow: Date;
} & Pick<UsagersFilterCriteria, "passage">): boolean {
  if (passage) {
    if (
      usager.decision?.statut !== "VALIDE" ||
      !usager.lastInteraction?.dateInteraction
    ) {
      return false;
    }
    let maxDateTime: number;
    switch (passage) {
      case "DEUX_MOIS":
        maxDateTime = subMonths(startOfDay(refDateNow), 2).getTime();
        break;
      case "TROIS_MOIS":
        maxDateTime = subMonths(startOfDay(refDateNow), 3).getTime();
        break;
      default:
        return true;
    }
    return (
      new Date(usager.lastInteraction.dateInteraction).getTime() <= maxDateTime
    );
  }
  return true;
}
