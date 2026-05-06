import { differenceInCalendarDays } from "date-fns";
import { UsagerLight } from "../../../../../../_common/model";
import { UsagersFilterCriteria } from "../../../classes/UsagersFilterCriteria";
import { USAGER_DEADLINES } from "../../../constants/USAGER_DEADLINES.const";

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

  const dateFin = new Date(usager.decision.dateFin);
  // Day-level comparison aligned with getDecisionDeadline thresholds.
  const daysBeforeEnd = differenceInCalendarDays(dateFin, new Date());

  if (echeance === "EXCEEDED") {
    return daysBeforeEnd < 0;
  }

  if (echeance === "NEXT_TWO_WEEKS") {
    return daysBeforeEnd >= 0 && daysBeforeEnd < 16;
  }

  if (echeance === "NEXT_TWO_MONTHS") {
    return daysBeforeEnd >= 0 && daysBeforeEnd < 61;
  }

  if (echeance.startsWith("PREVIOUS_")) {
    return dateFin < USAGER_DEADLINES[echeance].value;
  }

  return false;
}
