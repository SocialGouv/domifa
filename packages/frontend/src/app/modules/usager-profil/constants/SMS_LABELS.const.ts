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
  echeanceDeuxMois: "Sms rappel de renouvellement",
  dernierPassageTroisMois: "Avertissement dernier passage plus de 3 mois",
  idMonDomiFa: "Envoi des identifiants Mon DomiFa",
  decision: "Nouvelle décision",
};
