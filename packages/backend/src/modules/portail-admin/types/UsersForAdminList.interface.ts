import { UserStructure } from "@domifa/common";

export type UsersForAdminList = Pick<
  UserStructure,
  "id" | "email" | "nom" | "prenom" | "role" | "status" | "structureId"
> & { structureName: string };
