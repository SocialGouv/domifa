import { Structure } from "../../structures/structure-interface";
import { User } from "../../users/user.interface";

export type StatsExportUser = Pick<
  User,
  "id" | "email" | "nom" | "prenom" | "role" | "verified"
> & {
  structure: Pick<Structure, "id" | "nom">;
};
