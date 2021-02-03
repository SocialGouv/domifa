import { UsagersByStatus, UsagersFilterCriteriaStatut } from ".";
import { UsagerLight } from "../../../../../../_common/model";
import { usagerStatutChecker } from "./services";

export const usagersByStatusBuilder = {
  build,
};

function build(usagers: UsagerLight[]): UsagersByStatus {
  const acc: UsagersByStatus = {
    RADIE: [],
    VALIDE: [],
    REFUS: [],
    INSTRUCTION: [],
    ATTENTE_DECISION: [],
    TOUS: usagers,
  };
  return usagers.reduce((acc, usager) => {
    if (isStatus(usager, "RADIE")) {
      acc["RADIE"].push(usager);
    } else if (isStatus(usager, "VALIDE")) {
      acc["VALIDE"].push(usager);
    } else if (isStatus(usager, "REFUS")) {
      acc["REFUS"].push(usager);
    } else if (isStatus(usager, "INSTRUCTION")) {
      acc["INSTRUCTION"].push(usager);
    } else if (isStatus(usager, "ATTENTE_DECISION")) {
      acc["ATTENTE_DECISION"].push(usager);
    }
    return acc;
  }, acc);
}
function isStatus(usager: UsagerLight, statut: UsagersFilterCriteriaStatut) {
  return usagerStatutChecker.check({
    usager,
    statut,
  });
}
