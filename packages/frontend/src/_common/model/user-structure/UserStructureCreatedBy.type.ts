import { UserStructure } from "./UserStructure.type";

// UserStructureCreatedBy: attributs utilisés pour le stocakge des docks
export type UserStructureCreatedBy = Pick<
  UserStructure,
  "id" | "nom" | "prenom"
>;
