import { Structure } from "./Structure.type";

// Structure: attributs publics (retournés au frontend via UserStructureAuthenticated)
export type StructureCommon = Pick<
  Structure,
  | "id"
  | "adresse"
  | "createdAt"
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
  | "timeZone"
  | "responsable"
  | "options"
  | "adresseCourrier"
  | "sms"
  | "portailUsager"
  | "acceptTerms"
>;
