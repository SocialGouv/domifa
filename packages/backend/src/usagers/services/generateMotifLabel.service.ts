import {
  MOTIFS_REFUS_LABELS,
  MOTIFS_RADIATION_LABELS,
  USAGER_DECISION_STATUT_LABELS_PROFIL,
  UsagerDecisionMotif,
} from "@domifa/common";
import { UsagerDecision } from "../../_common/model";
import { format } from "date-fns";

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

export const generateNoteForDecision = (decision: UsagerDecision): string => {
  let strDecision = `Suppression de la décision : \n ${
    USAGER_DECISION_STATUT_LABELS_PROFIL[decision.statut]
  }`;
  const dateDebut = format(new Date(decision.dateDebut), "dd/MM/yyyy");

  if (decision.statut === "VALIDE") {
    const dateFin = format(new Date(decision.dateFin), "dd/MM/yyyy");
    strDecision = `${strDecision} du ${dateDebut} au ${dateFin}\n`;
  } else {
    strDecision = `${strDecision} le ${dateDebut}\n`;
  }
  return strDecision;
};
