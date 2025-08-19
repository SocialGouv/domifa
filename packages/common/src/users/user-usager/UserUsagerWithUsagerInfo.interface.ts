import { Usager } from "../../usager";
import { UserUsager } from "./UserUsager.interface";

export type UserUsagerWithUsagerInfo = Pick<
  UserUsager,
  "updatedAt" | "login" | "lastLogin" | "passwordLastUpdate" | "passwordType"
> &
  Pick<Usager, "nom" | "prenom" | "telephone" | "dateNaissance">;
