import { Structure } from "../../structures/structure-interface";
import { AppUser } from "../../_common/model";

export type StatsExportUser = Pick<
  AppUser,
  "id" | "email" | "nom" | "prenom" | "role" | "verified" | "structureId"
> & {
  structure: Pick<Structure, "id" | "nom">;
};
