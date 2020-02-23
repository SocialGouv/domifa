import { Document } from "mongoose";
import { User } from "../users/user.interface";

export interface Structure extends Document {
  adresse: string;
  complementAdresse: string;
  nom: string;
  structureType: string;
  rattachement: string;
  ville: string;
  departement: string;
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
    expireAt: Date;
  };
  token: string;
  verified: boolean;
  users: User[];
}
