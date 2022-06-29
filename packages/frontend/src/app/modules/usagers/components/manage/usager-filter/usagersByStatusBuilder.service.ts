import { UsagersByStatus, UsagersFilterCriteriaStatut } from ".";
import { UsagerLight } from "../../../../../../_common/model";
import { usagerStatutChecker } from "./services";

export const usagersByStatusBuilder = {
  build,
};

function build(usagers: UsagerLight[]): UsagersByStatus {
  const byStatus: UsagersByStatus = {
    RADIE: [],
    VALIDE: [],
    REFUS: [],
    INSTRUCTION: [],
    ATTENTE_DECISION: [],
    TOUS: usagers,
  };

  usagers.forEach((usager: UsagerLight) => {
    if (isStatus(usager, "RADIE")) {
      byStatus.RADIE.push(usager);
    } else if (isStatus(usager, "VALIDE")) {
      byStatus.VALIDE.push(usager);
    } else if (isStatus(usager, "REFUS")) {
      byStatus.REFUS.push(usager);
    } else if (isStatus(usager, "INSTRUCTION")) {
      byStatus.INSTRUCTION.push(usager);
    } else if (isStatus(usager, "ATTENTE_DECISION")) {
      byStatus.ATTENTE_DECISION.push(usager);
    }
  });

  return byStatus;
}

function isStatus(usager: UsagerLight, statut: UsagersFilterCriteriaStatut) {
  return usagerStatutChecker.check({
    usager,
    statut,
  });
}
