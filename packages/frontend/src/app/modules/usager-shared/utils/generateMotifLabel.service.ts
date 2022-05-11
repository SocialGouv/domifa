import { MOTIFS_RADIATION_LABELS } from "../../../../_common/model/usager/_constants/MOTIFS_RADIATION_LABELS.const";
import { MOTIFS_REFUS_LABELS } from "../../../../_common/model/usager/_constants/MOTIFS_REFUS_LABELS.const";
import { UsagerDecision } from "../../../../_common/model/usager/decision/UsagerDecision.type";

export const generateMotifLabel = (decision: UsagerDecision): string => {
  if (!decision) {
    return "";
  }

  let motif = "" as string;
  if (decision.statut === "REFUS" || decision.statut === "RADIE") {
    if (decision.motif === "AUTRE") {
      motif =
        decision.motifDetails !== "" && decision.motifDetails !== null
          ? "Autre motif : " + decision.motifDetails
          : ("Autre motif non précisé" as string);
    } else {
      motif =
        decision.statut === "REFUS"
          ? MOTIFS_REFUS_LABELS[decision.motif]
          : (MOTIFS_RADIATION_LABELS[decision.motif] as string);
    }
  }

  return motif;
};
