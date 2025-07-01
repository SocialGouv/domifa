import { UserFonction } from "../types/";

export const USER_FONCTION_LABELS: {
  [key in UserFonction]: string;
} = {
  president: "Président",
  directeur_responsable: "Directeur / Responsable",
  directeur_general_des_services: "Directeur général des services (DGS)",
  maire: "Maire",
  chef_de_service: "Chef de service",
  adjoint_administratif: "Adjoint administratif",
  secretaire_assistant_administratif: "Secrétaire / Assistant administratif",
  travailleur_social_assistant_social: "Travailleur social / Assistant social",
  agent_accueil: "Agent d'accueil",
  charge_de_mission_action_sociale: "Chargé de mission action sociale",
  conseiller_economie_sociale_et_familiale:
    "Conseiller en économie sociale et familiale (CESF)",
  mediation_sociale: "Personne en charge de la médiation sociale",
  rsa_insertion: "Personne en charge du RSA / Insertion",
  domiciliation: "Personne en charge de la domiciliation",
  benevole: "Bénévole",
  autre: "Autre",
};

export const USER_FONCTION_LABELS_LIST = Object.values(USER_FONCTION_LABELS);
