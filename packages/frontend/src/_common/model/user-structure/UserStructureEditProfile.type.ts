import { UserStructure } from "./UserStructure.type";

export type UserStructureEditProfile = Pick<
  UserStructure,
  "email" | "nom" | "prenom"
>;
