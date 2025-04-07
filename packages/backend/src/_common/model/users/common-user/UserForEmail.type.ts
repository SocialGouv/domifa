import { CommonUser } from "@domifa/common";

export type UserForEmail = Pick<CommonUser, "id" | "nom" | "prenom" | "email">;
