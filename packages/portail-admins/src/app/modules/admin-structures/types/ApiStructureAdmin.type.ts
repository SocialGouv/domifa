import { Structure } from "@domifa/common";

// Structure: attributs publics (retournés au frontend via UserStructureAuthenticated)
export type ApiStructureAdmin = Pick<
  Structure,
  | "id"
  | "createdAt"
  | "uuid"
  | "registrationDate"
  | "adresse"
  | "complementAdresse"
  | "nom"
  | "structureType"
  | "ville"
  | "departement"
  | "region"
  | "codePostal"
  | "email"
  | "verified"
  | "import"
  | "importDate"
  | "token"
  | "lastLogin"
> &
  Required<{ uuid: string }> & {
    users: number;
    usagers: number;
    actifs: number;
  };
