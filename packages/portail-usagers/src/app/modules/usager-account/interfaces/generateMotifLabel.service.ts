import {
  UsagerDecision,
  MOTIFS_REFUS_LABELS,
  MOTIFS_RADIATION_LABELS,
  UsagerDecisionMotif,
} from "../../../../_common";

export const generateMotifLabel = (decision: UsagerDecision): string => {
  if (!decision) {
    return "";
  }

  if (decision.motif === "AUTRE") {
    const motifDetails = decision.motifDetails ?? "non précisé";
    return `Autre motif: ${motifDetails}`;
  }

  const motifsLabels =
    decision.statut === "REFUS" ? MOTIFS_REFUS_LABELS : MOTIFS_RADIATION_LABELS;

  return motifsLabels[decision.motif as UsagerDecisionMotif] ?? "";
};
