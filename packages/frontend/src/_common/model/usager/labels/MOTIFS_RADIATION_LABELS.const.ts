import { UsagerDecisionMotif } from "..";

export const MOTIFS_RADIATION_LABELS: {
  [key in UsagerDecisionMotif]?: string;
} = {
  A_SA_DEMANDE: "À la demande de la personne",
  PLUS_DE_LIEN_COMMUNE: "Plus de lien avec la commune",
  FIN_DE_DOMICILIATION:
    "La domiciliation est arrivée à échéance (1 an) et son renouvellement n'a pas été sollicité",
  NON_MANIFESTATION_3_MOIS:
    "Non-manifestation de la personne pendant plus de 3 mois consécutifs",
  NON_RESPECT_REGLEMENT: "Non-respect du règlement",
  ENTREE_LOGEMENT: "Entrée dans un logement/hébergement stable",
};
