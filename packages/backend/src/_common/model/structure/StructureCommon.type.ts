import { Structure } from "./Structure.type";

// Structure: attributs publics (retournés au frontend via UserStructureAuthenticated)
export type StructureCommon = Pick<
  Structure,
  | "uuid"
  | "id"
  | "createdAt"
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
  | "telephone"
  | "email"
  | "responsable"
  | "options"
  | "adresseCourrier"
  | "sms"
  | "lastLogin"
  | "timeZone"
  | "portailUsager"
>;
