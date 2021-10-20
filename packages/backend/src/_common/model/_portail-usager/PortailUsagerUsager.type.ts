import { Usager } from "../usager/Usager.type";

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
  | "phone"
  | "ayantsDroits"
  | "etapeDemande"
  | "rdv"
  | "typeDom"
  | "datePremiereDom"
  | "decision"
  | "options"
  | "historique"
  | "lastInteraction"
>;
