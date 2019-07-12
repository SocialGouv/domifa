import { Document } from "mongoose";

export interface Structure extends Document {
  adresse: string;
  complementAdresse: string;
  nom: string;
  structureType: string;
  ville: string;
  departement: string;
  codePostal: string;
  agrement: string;
  phone: string;
  email: string;
  responsable: {
    fonction: string;
    nom: string;
    prenom: string;
  };
}
