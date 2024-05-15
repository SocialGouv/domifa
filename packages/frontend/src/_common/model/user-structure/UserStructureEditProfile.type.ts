import { UserStructure } from "@domifa/common";

export type UserStructureEditProfile = Pick<
  UserStructure,
  "email" | "nom" | "prenom"
>;
