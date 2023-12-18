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
  | "capacite"
  | "codePostal"
  | "agrement"
  | "telephone"
  | "email"
  | "responsable"
  | "options"
  | "adresseCourrier"
  | "verified"
  | "import"
  | "importDate"
  | "lastLogin"
  | "sms"
  | "portailUsager"
> &
  Required<{ uuid: string }>;
