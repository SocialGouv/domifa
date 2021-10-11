import { AppEntity } from "../_core";
import { StructureAddresseCourrier } from "./StructureAddresseCourrier.type";
import { StructurePortailUsagerParams } from "./StructurePortailUsagerParams.type";
import { StructureResponsable } from "./StructureResponsable.type";
import { StructureSmsParams } from "./StructureSmsParams.type";
import { StructureType } from "./StructureType.type";

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
  registrationDate: Date;
  importDate: Date;
  lastLogin: Date;

  responsable: StructureResponsable;

  hardReset: {
    token: string;
    expireAt?: Date;
  };

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
