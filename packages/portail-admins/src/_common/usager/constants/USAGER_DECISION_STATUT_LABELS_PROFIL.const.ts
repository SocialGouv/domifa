import { UsagerDecisionStatut } from "..";

/* DÉCISIONS */
export const USAGER_DECISION_STATUT_LABELS_PROFIL: {
  [key in UsagerDecisionStatut]: string;
} = {
  ATTENTE_DECISION: "Demande de domiciliation déposée",
  INSTRUCTION: "Instruction du dossier",
  RADIE: "Radiation",
  REFUS: "Demande refusée",
  VALIDE: "Domiciliation acceptée",
};
