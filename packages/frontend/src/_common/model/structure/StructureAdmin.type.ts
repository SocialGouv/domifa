import { Structure } from "./Structure.type";

// Structure: attributs publics (retournés au frontend via AppAuthUser)
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
  | "phone"
  | "email"
  | "responsable"
  | "options"
  | "adresseCourrier"
  | "verified"
  | "import"
  | "importDate"
  | "lastLogin"
  | "stats"
>;
