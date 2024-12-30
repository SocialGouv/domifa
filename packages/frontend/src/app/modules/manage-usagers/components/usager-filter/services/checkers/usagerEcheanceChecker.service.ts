import { UsagerLight } from "../../../../../../../_common/model";
import { UsagersFilterCriteria } from "../../UsagersFilterCriteria";
import { USAGER_DEADLINES } from "../../USAGER_DEADLINES.const";

export const usagerEcheanceChecker = {
  check,
};

function check({
  usager,
  echeance,
}: {
  usager: UsagerLight;
} & Pick<UsagersFilterCriteria, "echeance">): boolean {
  if (!echeance) {
    return true;
  }
  if (!usager.decision?.dateFin) {
    return false;
  }

  const today = new Date();
  const dateFin = new Date(usager.decision.dateFin);

  if (echeance === "EXCEEDED") {
    return dateFin < today;
  }

  const deadline = USAGER_DEADLINES[echeance].value;

  if (echeance.startsWith("NEXT_")) {
    return dateFin >= today && dateFin < deadline;
  }

  if (echeance.startsWith("PREVIOUS_")) {
    return dateFin < deadline;
  }

  return false;
}
