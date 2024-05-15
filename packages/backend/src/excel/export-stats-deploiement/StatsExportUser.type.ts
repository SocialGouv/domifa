import { Structure, UserStructure } from "@domifa/common";

export type StatsExportUser = Pick<
  UserStructure,
  "id" | "email" | "nom" | "prenom" | "role" | "verified" | "structureId"
> & {
  structure: Pick<Structure, "id" | "nom">;
};
