import { Usager } from "@domifa/common";

export type StructureUsagerExport = Pick<
  Usager,
  | "customRef"
  | "nom"
  | "prenom"
  | "surnom"
  | "sexe"
  | "dateNaissance"
  | "villeNaissance"
  | "langue"
  | "nationalite"
  | "email"
  | "telephone"
  | "ayantsDroits"
  | "typeDom"
  | "datePremiereDom"
  | "decision"
  | "historique"
  | "lastInteraction"
  | "options"
  | "numeroDistribution"
  | "entretien"
>;
