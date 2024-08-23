import { UsagerLight } from "../../../../../../../_common/model";
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
  if (statut && statut !== "TOUS" && statut !== usager.statut) {
    return false;
  }
  return true;
}
