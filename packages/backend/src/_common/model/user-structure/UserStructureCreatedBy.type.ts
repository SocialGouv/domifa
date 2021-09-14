import { UserStructure } from "./UserStructure.type";

export type UserStructureCreatedBy = Pick<
  UserStructure,
  "id" | "nom" | "prenom"
>;
