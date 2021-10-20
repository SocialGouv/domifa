import { UsagerDecision } from "../../../../_common";
import { MOTIFS_RADIATION_LABELS } from "../../../../_common/usager/constants/MOTIFS_RADIATION_LABELS.const";
import { MOTIFS_REFUS_LABELS } from "../../../../_common/usager/constants/MOTIFS_REFUS_LABELS.const";

export const generateMotifLabel = (decision: UsagerDecision): string => {
  if (!decision || !decision.motif) {
    return "";
  }

  let motif = "";
  if (decision.statut === "REFUS" || decision.statut === "RADIE") {
    if (decision.motif === "AUTRE") {
      motif =
        decision.motifDetails !== "" && decision.motifDetails !== null
          ? "Autre motif : " + decision.motifDetails
          : "Autre motif non précisé";
    } else {
      motif =
        decision.statut === "REFUS"
          ? MOTIFS_REFUS_LABELS[decision.motif]
          : (MOTIFS_RADIATION_LABELS[decision.motif] as any);
    }
  }

  return motif;
};
