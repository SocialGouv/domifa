import { Usager } from "@domifa/common";

// PortailUsagerStructure: attributs publics (retournés au Portail Usager via UserStructureAuthenticated)
export type PortailUsagerUsager = Pick<
  Usager, // @see USAGER_PORTAIL_ATTRIBUTES
  | "uuid"
  | "ref"
  | "customRef"
  | "structureId"
  | "nom"
  | "prenom"
  | "surnom"
  | "sexe"
  | "dateNaissance"
  | "villeNaissance"
  | "langue"
  | "email"
  | "telephone"
  | "ayantsDroits"
  | "etapeDemande"
  | "rdv"
  | "typeDom"
  | "datePremiereDom"
  | "contactByPhone"
  | "decision"
  | "options"
  | "historique"
  | "lastInteraction"
>;
