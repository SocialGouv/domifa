import { TimeZone } from "./../../../app/shared/territoires/types/TimeZone.type";
import { Telephone } from "../telephone";
import { AppEntity } from "../_core";
import { StructureAddresseCourrier } from "./StructureAddresseCourrier.type";
import { StructurePortailUsagerParams } from "./StructurePortailUsagerParams.type";
import { StructureResponsable } from "./StructureResponsable.type";
import { StructureSmsParams } from "./StructureSmsParams.type";
import { StructureType } from "./StructureType.type";

export type Structure = AppEntity & {
  id: number;
  adresse: string;
  createdAt?: Date;
  complementAdresse: string;
  nom: string;
  structureType: StructureType;
  ville: string;
  departement: string;
  region: string;
  capacite: number | null;
  codePostal: string;
  agrement: string | null;
  telephone: Telephone;
  email: string;
  import: boolean;
  registrationDate: Date;
  importDate: Date;
  lastLogin: Date;

  responsable: StructureResponsable;

  hardReset: {
    token: string;
    expireAt?: Date;
  };

  timeZone: TimeZone;
  tokenDelete: string;

  adresseCourrier: StructureAddresseCourrier;

  options: {
    numeroBoite: boolean;
  };
  token: string;
  verified: boolean;

  sms: StructureSmsParams;
  portailUsager: StructurePortailUsagerParams;
};
