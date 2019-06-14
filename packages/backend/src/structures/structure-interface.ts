import { Document } from 'mongoose';

export interface Structure extends Document {
  adresse: string,
  complementAdresse: string,
  nom: string,
  structureType: number,
  ville: string,
  departement: string,
  codePostal: string,
  agrement: string,
  password: string,
  phone: string,
  email: string,
  responsable: {
    fonction: string,
    nom: string,
    prenom: string,
  }
}
