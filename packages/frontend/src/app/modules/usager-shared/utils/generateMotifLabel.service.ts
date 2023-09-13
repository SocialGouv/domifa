import { MOTIFS_REFUS_LABELS, MOTIFS_RADIATION_LABELS } from "@domifa/common";
import { UsagerDecision } from "../../../../_common/model";

export const generateMotifLabel = (decision: UsagerDecision): string => {
  if (!decision) {
    return "";
  }
  if (!decision.motif) {
    return "";
  }

  if (decision.motif === "AUTRE") {
    const motifDetails = decision.motifDetails ?? "non précisé";
    return `Autre motif: ${motifDetails}`;
  }

  const motifsLabels =
    decision.statut === "REFUS" ? MOTIFS_REFUS_LABELS : MOTIFS_RADIATION_LABELS;

  return motifsLabels[decision.motif] ?? "";
};
