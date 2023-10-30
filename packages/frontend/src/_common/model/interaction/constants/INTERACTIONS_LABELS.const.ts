import { InteractionType } from "@domifa/common";

export const INTERACTIONS_LABELS_SINGULIER: {
  [key in InteractionType]: string;
} = {
  appel: "Appel téléphonique enregistré",
  colisIn: "Colis enregistré",
  colisOut: "Colis remis",
  courrierIn: "Courrier enregistré",
  courrierOut: "Courrier remis",
  recommandeIn: "Avis de passage enregistré",
  recommandeOut: "Avis de passage remis",
  visite: "Passage enregistré",
  npai: "Le courrier ne sera plus enregistré",
  loginPortail: "Connexion au portail usager",
};

export const INTERACTIONS_LABELS_PLURIEL: {
  [key in InteractionType]: string;
} = {
  appel: "Appels téléphoniques",
  colisIn: "Colis enregistrés",
  colisOut: "Colis remis",
  courrierIn: "Courriers enregistrés",
  courrierOut: "Courriers remis",
  recommandeIn: "Avis de passage enregistrés",
  recommandeOut: "Avis de passage remis",
  visite: "Passages enregistrés",
  npai: "Pli non distribuable enregistré",
  loginPortail: "Connexion au portail usager",
};
