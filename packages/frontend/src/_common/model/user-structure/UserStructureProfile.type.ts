import { UserStructure } from "./UserStructure.type";

export type UserStructureProfile = Pick<
  UserStructure,
  "email" | "nom" | "prenom" | "role" | "verified" | "uuid"
>;
