import { MOTIFS_REFUS_LABELS, MOTIFS_RADIATION_LABELS } from "../constants";
import { type UsagerDecision } from "../interfaces";

export const generateMotifLabel = (
  decision: Pick<UsagerDecision, "motif" | "motifDetails" | "statut">
): string => {
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
