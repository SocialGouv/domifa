import { UsagerLight } from "../../../../../../../../_common/model";
import { UsagersFilterCriteria } from "../../UsagersFilterCriteria";

export const usagerEcheanceChecker = {
  check,
};

function check({
  usager,
  echeance,
}: {
  usager: UsagerLight;
} & Pick<UsagersFilterCriteria, "echeance">): boolean {
  if (echeance) {
    // TODO @toub
    switch (echeance) {
      case "DEPASSEE":
        // { $lte: today },
        break;
      case "DEUX_MOIS":
        // { $lte: nextTwoMonths, $gte: today },
        break;
      case "DEUX_SEMAINES":
        //  $lte: nextTwoWeeks, $gte: today },
        break;
    }
  }
  return true;
}
