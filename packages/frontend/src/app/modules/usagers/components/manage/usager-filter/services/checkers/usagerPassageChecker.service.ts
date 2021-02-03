import moment from "moment";
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
        maxDateTime = moment(refDateNow)
          .utc()
          .startOf("day")
          .subtract(2, "months")
          .toDate()
          .getTime();
        break;
      case "TROIS_MOIS":
        maxDateTime = moment(refDateNow)
          .utc()
          .startOf("day")
          .subtract(3, "months")
          .toDate()
          .getTime();
        break;
      default:
        console.error('Invalid valid for filter "passage"');
        return true;
    }
    return (
      new Date(usager.lastInteraction.dateInteraction).getTime() <= maxDateTime
    );
  }
  return true;
}
