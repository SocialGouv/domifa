import { UserStructure } from "@domifa/common";

export type UsersForAdminList = Pick<
  UserStructure,
  "id" | "email" | "nom" | "prenom" | "role" | "verified" | "structureId"
> & { structureName: string };
