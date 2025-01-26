import { UserStructureProfile } from "@domifa/common";

export const VERIFIED_USERS_STRUCTURE: Pick<
  UserStructureProfile,
  "id" | "nom" | "prenom"
>[] = [
  {
    id: 1,
    nom: "Martin",
    prenom: "Sophie",
  },
  {
    id: 2,
    nom: "Dubois",
    prenom: "Pierre",
  },
  {
    id: 3,
    nom: "Laurent",
    prenom: "Marie",
  },
];
