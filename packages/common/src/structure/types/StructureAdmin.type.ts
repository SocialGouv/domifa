import { Structure } from "../interfaces";

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
  | "departmentName"
  | "region"
  | "regionName"
  | "capacite"
  | "codePostal"
  | "agrement"
  | "email"
  | "responsable"
  | "options"
  | "adresseCourrier"
  | "sms"
  | "portailUsager"
  | "statut"
  | "decision"
  | "import"
  | "timeZone"
  | "importDate"
  | "lastLogin"
> & {
  users: number;
  usagers: number;
  actifs: number;
};
