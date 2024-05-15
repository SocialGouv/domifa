import { type UserStructure } from "../interfaces";

// UserStructureCreatedBy: attributs utilisés pour le stocakge des docks
export type UserStructureCreatedBy = Pick<
  UserStructure,
  "id" | "nom" | "prenom"
>;
