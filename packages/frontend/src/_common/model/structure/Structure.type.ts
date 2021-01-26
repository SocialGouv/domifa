import { AppEntity } from "../_core";
import { StructureAddresseCourrier } from "./StructureAddresseCourrier.type";
import { StructureResponsable } from "./StructureResponsable.type";
import { StructureType } from "./StructureType.type";
import { StructureUsagersStats } from "./StructureUsagersStats.type";

export type Structure = AppEntity & {
  id: number;
  adresse: string;
  complementAdresse: string;
  nom: string;
  structureType: StructureType;
  ville: string;
  departement: string;
  region: string;
  capacite: number;
  codePostal: string;
  agrement: string;
  phone: string;
  email: string;
  import: boolean;
  importDate: Date;
  lastLogin: Date;

  responsable: StructureResponsable;

  hardReset: {
    token: string;
    expireAt?: Date;
  };

  tokenDelete: string;

  adresseCourrier: StructureAddresseCourrier;

  lastExport: Date;
  stats: StructureUsagersStats;
  options: {
    numeroBoite: boolean;
  };
  token: string;
  verified: boolean;
};
