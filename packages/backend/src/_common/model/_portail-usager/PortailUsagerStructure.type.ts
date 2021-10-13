import { Structure } from "../structure/Structure.type";

// PortailUsagerStructure: attributs publics (retournés au Portail Usager via UserStructureAuthenticated)
export type PortailUsagerStructure = Pick<
  Structure, // @see STRUCTURE_PORTAIL_ATTRIBUTES
  | "uuid"
  | "id"
  // | "adresse"
  // | "complementAdresse"
  | "nom"
  // | "structureType"
  // | "codePostal"
  | "ville"
  // | "departement"
  // | "region"
  // | "capacite"
  // | "agrement"
  // | "phone"
  // | "email"
  // | "responsable"
  // | "options"
  // | "adresseCourrier"
  // | "sms"
>;
