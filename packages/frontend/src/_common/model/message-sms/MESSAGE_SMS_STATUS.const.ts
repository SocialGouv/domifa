import { MessageSmsId } from "./MessageSmsId.type";
import { MessageSmsStatus } from "./MessageSmsStatus.type";
export const MESSAGE_SMS_STATUS: {
  [key in MessageSmsStatus]: {
    label: string;
    description: string;
    color: string;
  };
} = {
  TO_SEND: {
    label: "Envoi prévu",
    description: "",
    color: "grey-status",
  },
  ON_HOLD: {
    label: "En cours",
    description: "Le SMS est en cours d’envoi",
    color: "grey-status",
  },
  SENT_AND_RECEIVED: {
    label: "Envoyé et reçu",
    description: "Le SMS a bien été livré",
    color: "green-status",
  },
  SENT_AND_NOT_RECEIVED: {
    label: "Envoyé",
    description:
      "Le SMS a bien été envoyé sur un numéro valide, mais le mobile est pour l’instant injoignable",
    color: "green-status",
  },
  IN_PROGRESS: {
    label: "Envoi en cours",
    description: "Le SMS est en cours d’envoi",
    color: "orange-status",
  },
  FAILURE: {
    label: "Échec",
    description:
      "Le SMS n’a pas pu être délivré, car le numéro est annoncé résilié par les opérateurs",
    color: "red-status",
  },
  EXPIRED: {
    label: "Expiré",
    description: "Le mobile du destinataire reste injoignable après 48H,",
    color: "red-status",
  },
  DISABLED: {
    label: "Désactivé",
    description: "Cet envoi a été désactivé par l'administrateur",
    color: "red-status",
  },
};

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
