import { Structure } from "./Structure.type";

// Structure: attributs publics (retournés au frontend via UserStructureAuthenticated)
export type StructureAdmin = Pick<
  Structure,
  | "id"
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
  | "email"
  | "responsable"
  | "options"
  | "adresseCourrier"
  | "sms"
  | "portailUsager"
  | "verified"
  | "import"
  | "timeZone"
  | "importDate"
  | "lastLogin"
>;
