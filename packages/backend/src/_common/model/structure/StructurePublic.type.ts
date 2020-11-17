import { Structure } from "../../../structures/structure-interface";

// Structure: attributs publics (retournés au frontend via AppAuthUser)
export type StructurePublic = Pick<
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
>;
