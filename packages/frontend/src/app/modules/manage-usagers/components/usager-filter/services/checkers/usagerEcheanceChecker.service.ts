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

  // Convertit les dates en format YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];
  const dateFin = new Date(usager.decision.dateFin).toISOString().split("T")[0];

  if (echeance === "EXCEEDED") {
    return dateFin < today;
  }
  const deadline = USAGER_DEADLINES[echeance].value.toISOString().split("T")[0];

  if (echeance.startsWith("NEXT_")) {
    return dateFin >= today && dateFin <= deadline;
  }

  if (echeance.startsWith("PREVIOUS_")) {
    return dateFin < deadline;
  }

  return false;
}
