import { AppUser } from "./AppUser.type";

export type UserEditProfile = Pick<AppUser, "email" | "nom" | "prenom">;
