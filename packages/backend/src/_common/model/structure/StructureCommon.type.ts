import { StructurePG } from "./StructurePG.type";

// Structure: attributs publics (retournés au frontend via AppAuthUser)
export type StructureCommon = Pick<
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
>;
