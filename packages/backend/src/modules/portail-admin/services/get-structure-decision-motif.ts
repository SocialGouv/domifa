import {
  MOTIFS_REFUS_STRUCTURE_LABELS,
  MOTIFS_SUPPRESSION_STRUCTURE_LABELS,
  StructureDecisionRefusMotif,
  StructureDecisionStatut,
  StructureDecisionSuppressionMotif,
} from "@domifa/common";

export const getStructureDecisionMotif = (
  statut: StructureDecisionStatut,
  motif?: StructureDecisionRefusMotif | StructureDecisionSuppressionMotif
): string => {
  if (statut === "VALIDE" || statut === "EN_ATTENTE") {
    return "";
  }

  if (statut === "REFUS") {
    return MOTIFS_REFUS_STRUCTURE_LABELS[motif];
  } else if (statut === "SUPPRIME") {
    return MOTIFS_SUPPRESSION_STRUCTURE_LABELS[motif];
  }

  return "";
};
