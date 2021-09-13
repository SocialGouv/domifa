import { UserStructure } from "./UserStructure.type";

export type UserStructureProfile = Pick<
  UserStructure,
  "id" | "email" | "nom" | "prenom" | "role" | "verified"
>;
