import { UserStructure } from "@domifa/common";

export type UserStructureEditProfile = Pick<
  UserStructure,
  "nom" | "prenom" | "fonction" | "fonctionDetail"
>;
