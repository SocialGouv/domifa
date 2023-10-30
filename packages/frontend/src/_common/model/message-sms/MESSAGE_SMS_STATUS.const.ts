import { MessageSmsId } from "@domifa/common";

export const SMS_LABELS: {
  [key in MessageSmsId]: string;
} = {
  appel: "Appel téléphonique enregistré",
  colisIn: "Colis enregistré",
  colisOut: "Colis remis",
  courrierIn: "Courrier enregistré",
  courrierOut: "Courrier remis",
  recommandeIn: "Avis de passage enregistré",
  recommandeOut: "Avis de passage remis",
  visite: "Passage enregistré",
  npai: "Pli non distribuable",
  echeanceDeuxMois: "Sms rappel de renouvellement",
  dernierPassageTroisMois: "Avertissement dernier passage plus de 3 mois",
  decision: "Nouvelle décision",
  loginPortail: "Connexion au portail usager",
};
