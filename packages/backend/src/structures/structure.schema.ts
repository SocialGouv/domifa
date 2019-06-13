// tslint:disable: object-literal-sort-keys

import * as mongoose from 'mongoose';

export const StructureSchema = new mongoose.Schema({
  id: Number,
  adresse: String,
  complementAdresse: String,
  nom: String,
  structureType: Number,
  ville: String,
  departement: String,
  codePostal: String,
  agrement: String,
  password: String,
  phone: String,
  email: String,
  responsable: {
    fonction: String,
    nom: String,
    prenom: String,
  },
  users : [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});
