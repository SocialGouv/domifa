import { UserFonction } from "../types";

export interface UserFonctionMapping {
  canonicalName: UserFonction;
  synonyms: string[];
  exclude?: string[];
}
