import { Document } from "mongoose";
import { StructureResponsable, StructureType } from "../_common/model";

export interface Structure extends Document {
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
    expireAt: Date | null;
  };

  tokenDelete: string;

  adresseCourrier: {
    actif: boolean;
    adresse: string;
    ville: string;
    codePostal: string;
  };

  usersCount: number;

  lastExport: Date;
  stats: { VALIDE: number; REFUS: number; RADIE: number; TOTAL: number };
  options: {
    numeroBoite: boolean;
  };
  token: string;
  verified: boolean;

  createdAt: Date;
  migrated?: boolean;
}
