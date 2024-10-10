import { Structure } from "@domifa/common";

// Structure: attributs publics (retournés au frontend via UserStructureAuthenticated)
export type StructureAdmin = Pick<
  Structure,
  | "id"
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
  | "lastLogin"
> &
  Required<{ uuid: string }> & {
    users: number;
    usagers: number;
  };
