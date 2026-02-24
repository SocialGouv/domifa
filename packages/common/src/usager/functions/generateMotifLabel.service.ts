import { MOTIFS_REFUS_LABELS, MOTIFS_RADIATION_LABELS } from "../constants";
import { type UsagerDecision } from "../interfaces";

const ucFirst = (value: string): string => {
  return !value || value === ""
    ? ""
    : value.charAt(0).toUpperCase() + value.slice(1);
};

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
    const motifDetails = decision.motifDetails?.trim();
    return motifDetails ? ucFirst(motifDetails) : "Motif non précisé";
  }

  const motifsLabels =
    decision.statut === "REFUS" ? MOTIFS_REFUS_LABELS : MOTIFS_RADIATION_LABELS;

  const label = motifsLabels[decision.motif] ?? "";
  return ucFirst(label);
};
