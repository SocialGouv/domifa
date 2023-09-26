import { TimeZone } from "../../../util/territoires";
import { AppEntity } from "../_core";
import { StructureAddresseCourrier } from "./StructureAddresseCourrier.type";
import { StructurePortailUsagerParams } from "./StructurePortailUsagerParams.type";
import { StructureResponsable } from "./StructureResponsable.type";
import { StructureSmsParams } from "./StructureSmsParams.type";
import { Telephone } from "../telephone/Telephone.type";
import { StructureType } from "@domifa/common";

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

  options: {
    numeroBoite: boolean;
  };

  token: string;
  verified: boolean;

  timeZone: TimeZone;
  filesUpdated: boolean;

  sms: StructureSmsParams;
  portailUsager: StructurePortailUsagerParams;

  latitude: number;
  longitude: number;
};
