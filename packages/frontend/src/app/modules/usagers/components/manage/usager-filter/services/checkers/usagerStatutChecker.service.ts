import {
  UsagerDecisionStatut,
  UsagerLight,
} from "../../../../../../../../_common/model";
import { UsagersFilterCriteria } from "../../UsagersFilterCriteria";

export const usagerStatutChecker = {
  check,
};

function check({
  usager,
  statut,
}: {
  usager: UsagerLight;
} & Pick<UsagersFilterCriteria, "statut">): boolean {
  if (statut && statut !== "TOUS") {
    if (statut === "RENOUVELLEMENT") {
      const validStatuts: UsagerDecisionStatut[] = [
        "INSTRUCTION",
        "ATTENTE_DECISION",
      ];
      if (
        !validStatuts.includes(usager.decision?.statut) ||
        usager.typeDom !== "RENOUVELLEMENT"
      ) {
        return false;
      }
    } else {
      if (statut !== usager.decision?.statut) {
        return false;
      }
    }
  }
  return true;
}
