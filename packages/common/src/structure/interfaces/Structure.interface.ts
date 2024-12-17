import { type AppEntity } from "../../_core";
import { type Telephone } from "../../telephone";
import { type TimeZone } from "../../territoires/types";
import { type StructureType } from "../types";
import { type StructureAddresseCourrier } from "./StructureAddresseCourrier.interface";
import { type StructureOptions } from "./StructureOptions.interface";
import { type StructureOrganismeType } from "./StructureOrganismeType.type";
import { type StructurePortailUsagerParams } from "./StructurePortailUsagerParams.interface";
import { type StructureResponsable } from "./StructureResponsable.interface";
import { type StructureSmsParams } from "./StructureSmsParams.interface";

export interface Structure extends AppEntity {
  id: number;
  adresse: string;
  complementAdresse: string;
  nom: string;
  structureType: StructureType;
  ville: string;
  departement: string;
  region: string;

  // Only for stats
  departmentName?: string;
  regionName?: string;

  capacite: number;
  codePostal: string;
  agrement: string;
  telephone: Telephone;
  email: string;
  import: boolean;
  registrationDate: Date;
  importDate: Date;
  lastLogin: Date;
  acceptTerms: Date | null;

  responsable: StructureResponsable;

  organismeType: StructureOrganismeType | null;
  hardReset: {
    token: string;
    expireAt?: Date;
  };

  tokenDelete: string;

  adresseCourrier: StructureAddresseCourrier;

  options: StructureOptions;

  token: string;
  verified: boolean;

  timeZone: TimeZone;
  sms: StructureSmsParams;
  portailUsager: StructurePortailUsagerParams;

  latitude: number;
  longitude: number;
}
