import { Structure } from "@domifa/common";

// PortailUsagerStructure: attributs publics (retournés au Portail Usager via UserStructureAuthenticated)
export type PortailUsagerStructure = Pick<
  Structure, // @see STRUCTURE_PORTAIL_ATTRIBUTES
  "uuid" | "id" | "nom" | "ville"
>;
