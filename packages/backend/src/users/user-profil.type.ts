import { User } from "./user.interface";

export type UserProfil = Pick<
  User,
  "id" | "email" | "nom" | "prenom" | "role" | "verified"
>;
