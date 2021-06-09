import moment from "moment";
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
    const todayTime = moment(refDateNow)
      .utc()
      .startOf("day")
      .toDate()
      .getTime();
    switch (echeance) {
      case "DEPASSEE": {
        const maxDateTime = todayTime;
        const dateFinTime = new Date(usager.decision.dateFin).getTime();
        return dateFinTime <= maxDateTime;
      }
      case "DEUX_MOIS": {
        const minDateTime = todayTime;
        const maxDateTime = moment(refDateNow)
          .startOf("day")
          .add(2, "months")
          .toDate()
          .getTime();
        const dateFinTime = new Date(usager.decision.dateFin).getTime();

        return dateFinTime <= maxDateTime && dateFinTime >= minDateTime;
      }
      case "DEUX_SEMAINES": {
        const minDateTime = todayTime;
        const maxDateTime = moment(refDateNow)
          .utc()
          .startOf("day")
          .add(14, "days")
          .toDate()
          .getTime();
        const dateFinTime = new Date(usager.decision.dateFin).getTime();
        return dateFinTime <= maxDateTime && dateFinTime >= minDateTime;
      }
      default:
        console.error('Invalid valid for filter "passage"');
        return true;
    }
  }
  return true;
}
