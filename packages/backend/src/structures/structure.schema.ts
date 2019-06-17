// tslint:disable: object-literal-sort-keys

import * as mongoose from "mongoose";

export const StructureSchema = new mongoose.Schema({
  id: Number,
  adresse: { type: String, default: "", required: true },
  complementAdresse: { type: String, default: "", required: true },
  nom: { type: String, default: "", required: true },
  structureType: { type: Number, default: 0, required: true },
  ville: { type: String, default: "", required: true },
  departement: { type: String, default: "", required: true },
  codePostal: { type: String, default: "", required: true },
  agrement: { type: String, default: "", required: true },
  phone: { type: String, default: "", required: true },
  email: { type: String, default: "", required: true },
  responsable: {
    fonction: { type: String, default: "", required: true },
    nom: { type: String, default: "", required: true },
    prenom: { type: String, default: "", required: true }
  },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});
