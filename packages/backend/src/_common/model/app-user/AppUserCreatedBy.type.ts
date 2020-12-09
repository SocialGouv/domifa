import { AppUser } from "./AppUser.type";

// AppUserCreatedBy: attributs utilisés pour le stocakge des docks
export type AppUserCreatedBy = Pick<AppUser, "id" | "nom" | "prenom">;
