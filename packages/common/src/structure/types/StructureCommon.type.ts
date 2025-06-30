import { type Structure } from "../interfaces";

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
  | "organismeType"
  | "codePostal"
  | "agrement"
  | "telephone"
  | "email"
  | "responsable"
  | "options"
  | "adresseCourrier"
  | "sms"
  | "lastLogin"
  | "timeZone"
  | "acceptTerms"
  | "portailUsager"
  | "reseau"
  | "registrationData"
  | "siret"
>;
