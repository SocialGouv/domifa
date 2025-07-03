import { UserFonction } from "../types/";

export const USER_FONCTION_LABELS: {
  [key in UserFonction]: string;
} = {
  PRESIDENT: "Président",
  DIRECTEUR_RESPONSABLE: "Directeur / Responsable",
  DIRECTEUR_GENERAL_DES_SERVICES: "Directeur général des services (DGS)",
  MAIRE: "Maire",
  CHEF_DE_SERVICE: "Chef de service",
  ADJOINT_ADMINISTRATIF: "Adjoint administratif",
  SECRETAIRE_ASSISTANT_ADMINISTRATIF: "Secrétaire / Assistant administratif",
  TRAVAILLEUR_SOCIAL_ASSISTANT_SOCIAL: "Travailleur social / Assistant social",
  AGENT_ACCUEIL: "Agent d'accueil",
  CHARGE_DE_MISSION_ACTION_SOCIALE: "Chargé de mission action sociale",
  CONSEILLER_ECONOMIE_SOCIALE_ET_FAMILIALE:
    "Conseiller en économie sociale et familiale (CESF)",
  MEDIATION_SOCIALE: "Personne en charge de la médiation sociale",
  RSA_INSERTION: "Personne en charge du RSA / Insertion",
  DOMICILIATION: "Personne en charge de la domiciliation",
  BENEVOLE: "Bénévole",
  AUTRE: "Autre",
};

export const USER_FONCTION_LABELS_LIST = Object.values(USER_FONCTION_LABELS);
