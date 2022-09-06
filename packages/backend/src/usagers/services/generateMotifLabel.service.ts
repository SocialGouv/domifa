import { UsagerDecisionMotif } from "./../../_common/model/usager/UsagerDecisionMotif.type";
import {
  MOTIFS_RADIATION_LABELS,
  MOTIFS_REFUS_LABELS,
  UsagerDecision,
} from "../../_common/model";

export const generateMotifLabel = (decision: UsagerDecision): string => {
  if (!decision) {
    return "";
  }

  let motif = "";
  if (decision.statut === "REFUS" || decision.statut === "RADIE") {
    if (decision.motif === "AUTRE") {
      motif =
        decision.motifDetails !== "" && decision.motifDetails !== null
          ? "Autre motif : " + decision.motifDetails
          : ("Autre motif non précisé" as any);
    } else {
      motif =
        decision.statut === "REFUS"
          ? MOTIFS_REFUS_LABELS[decision.motif as UsagerDecisionMotif]
          : (MOTIFS_RADIATION_LABELS[
              decision.motif as UsagerDecisionMotif
            ] as any);
    }
  }

  return motif;
};
