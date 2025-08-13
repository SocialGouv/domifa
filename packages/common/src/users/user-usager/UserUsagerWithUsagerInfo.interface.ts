import { Usager } from "../../usager";
import { UserUsager } from "./UserUsager.interface";

export type UserUsagerWithUsagerInfo = Pick<
  UserUsager,
  | "updatedAt"
  | "login"
  | "isTemporaryPassword"
  | "lastLogin"
  | "passwordLastUpdate"
  | "isBirthDate"
> &
  Pick<Usager, "nom" | "prenom" | "telephone" | "dateNaissance">;
