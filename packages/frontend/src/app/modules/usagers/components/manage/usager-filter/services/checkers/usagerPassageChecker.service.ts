import { UsagerLight } from "../../../../../../../../_common/model";
import { UsagersFilterCriteria } from "../../UsagersFilterCriteria";

export const usagerPassageChecker = {
  check,
};

function check({
  usager,
  passage,
}: {
  usager: UsagerLight;
} & Pick<UsagersFilterCriteria, "passage">): boolean {
  if (passage) {
    // TODO @toub
    switch (passage) {
      case "DEUX_MOIS":
        // { $lte: lastTwoMonths },
        break;
      case "TROIS_MOIS":
        // { $lte: lastThreeMonths },
        break;
    }
  }
  return true;
}

// const today = moment().utc().startOf("day").toDate();

// const nextTwoMonths: Date = moment()
//   .startOf("day")
//   .add(2, "months")
//   .toDate();

// const nextTwoWeeks: Date = moment()
//   .utc()
//   .startOf("day")
//   .add(14, "days")
//   .toDate();

// const lastTwoMonths: Date = moment()
//   .utc()
//   .startOf("day")
//   .subtract(2, "months")
//   .toDate();

// const lastThreeMonths: Date = moment()
//   .utc()
//   .startOf("day")
//   .subtract(3, "months")
//   .toDate();

// const echeances: {
//   [key: string]: {};
// } = {
//   DEPASSEE: { $lte: today },
//   DEUX_MOIS: { $lte: nextTwoMonths, $gte: today },
//   DEUX_SEMAINES: { $lte: nextTwoWeeks, $gte: today },
// };

// const passages: {
//   [key: string]: {};
// } = {
//   DEUX_MOIS: { $lte: lastTwoMonths },
//   TROIS_MOIS: { $lte: lastThreeMonths },
// };
