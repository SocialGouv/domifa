import { Document } from "mongoose";
import { User } from "../users/user.interface";

export interface Structure extends Document {
  id: number;
  adresse: string;
  complementAdresse: string;
  nom: string;
  structureType: string;
  ville: string;
  departement: string;
  region: string;
  capacite: number;
  codePostal: string;
  agrement: string;
  phone: string;
  email: string;

  responsable: {
    fonction: string;
    nom: string;
    prenom: string;
  };

  hardReset: {
    token: string;
    expireAt: Date | null;
  };

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
  };
  token: string;
  verified: boolean;
  users: User[];
}
