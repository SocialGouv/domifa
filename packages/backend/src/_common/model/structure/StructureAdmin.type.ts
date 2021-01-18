import { StructurePG } from "./StructurePG.type";

// Structure: attributs publics (retournés au frontend via AppAuthUser)
export type StructureAdmin = Pick<
  StructurePG,
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
>;
