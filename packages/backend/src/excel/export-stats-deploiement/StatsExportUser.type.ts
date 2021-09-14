import { Structure, UserStructure } from "../../_common/model";

export type StatsExportUser = Pick<
  UserStructure,
  "id" | "email" | "nom" | "prenom" | "role" | "verified" | "structureId"
> & {
  structure: Pick<Structure, "id" | "nom">;
};
