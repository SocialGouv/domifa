import {
  MOTIFS_REFUS_STRUCTURE_LABELS,
  MOTIFS_SUPPRESSION_STRUCTURE_LABELS,
} from "../constants";
import {
  StructureDecisionRefusMotif,
  StructureDecisionSuppressionMotif,
} from "../enums";
import { StructureDecisionStatut } from "../types";

export function getStructureDecisionMotif(
  statut: StructureDecisionStatut,
  motif?: StructureDecisionRefusMotif | StructureDecisionSuppressionMotif
): string {
  if (statut === "VALIDE" || statut === "EN_ATTENTE") {
    return "";
  }
  if (statut === "REFUS") {
    return MOTIFS_REFUS_STRUCTURE_LABELS[motif as StructureDecisionRefusMotif];
  }
  if (statut === "SUPPRIME") {
    return MOTIFS_SUPPRESSION_STRUCTURE_LABELS[
      motif as StructureDecisionSuppressionMotif
    ];
  }
  return "";
}
