import { Document } from "mongoose";
import { User } from "../users/user.interface";
import { StructureType } from "../_common/model";

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

  responsable: {
    fonction: string;
    nom: string;
    prenom: string;
  };

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

  lastExport: Date;
  stats: { VALIDE: number; REFUS: number; RADIE: number; TOTAL: number };
  options: {
    colis: boolean;
    customId: boolean;
    rattachement: boolean;
    numeroBoite: boolean;
    mailsRdv: boolean;
  };
  token: string;
  verified: boolean;
  users: User[];
  createdAt: Date;
}
