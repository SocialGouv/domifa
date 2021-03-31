import { AppUser, Structure } from "../../_common/model";

export type StatsExportUser = Pick<
  AppUser,
  "id" | "email" | "nom" | "prenom" | "role" | "verified" | "structureId"
> & {
  structure: Pick<Structure, "id" | "nom">;
};
