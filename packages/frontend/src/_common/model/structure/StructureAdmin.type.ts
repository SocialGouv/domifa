import { Structure } from "./Structure.type";

// Structure: attributs publics (retournés au frontend via AppAuthUser)
export type StructureAdmin = Pick<
  Structure,
  | "id"
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
  | "createdAt"
  | "import"
  | "importDate"
  | "lastLogin"
  | "stats"
> & {
  usersCount?: number; // dashboard only
};
