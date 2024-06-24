import {
  StructureType,
  StructureAddresseCourrier,
  AppEntity,
} from "@domifa/common";

export type StructurePublic = AppEntity & {
  id: number;
  adresse: string;
  complementAdresse: string;
  nom: string;
  structureType: StructureType;
  ville: string;
  departement: string;
  region: string;
  codePostal: string;
  email: string;
  tokenDelete: string;
  adresseCourrier: StructureAddresseCourrier;
};
