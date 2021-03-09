import { Structure } from "./Structure.type";

// Structure: attributs publics (retournés au frontend via AppAuthUser)
export type StructureCommon = Pick<
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
  | "sms"
>;
