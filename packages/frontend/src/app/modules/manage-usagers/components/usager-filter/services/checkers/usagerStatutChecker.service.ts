import { UsagersFilterCriteriaStatut } from "@domifa/common";
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
  if (!statut || statut === UsagersFilterCriteriaStatut.TOUS) {
    return true;
  }
  return statut === usager.statut;
}
