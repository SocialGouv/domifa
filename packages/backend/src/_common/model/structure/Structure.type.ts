import { TimeZone } from "../../../util/territoires";

import { Telephone } from "../telephone/Telephone.type";
import {
  StructureOptions,
  StructureType,
  StructureAddresseCourrier,
  StructurePortailUsagerParams,
  StructureResponsable,
  StructureSmsParams,
  AppEntity,
} from "@domifa/common";

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
  telephone: Telephone;
  email: string;
  import: boolean;
  registrationDate: Date;
  importDate: Date;
  lastLogin: Date;
  acceptTerms: Date | null;

  responsable: StructureResponsable;

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
  filesUpdated: boolean;

  sms: StructureSmsParams;
  portailUsager: StructurePortailUsagerParams;

  latitude: number;
  longitude: number;
};
