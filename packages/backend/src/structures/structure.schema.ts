// tslint:disable: object-literal-sort-keys
import * as mongoose from "mongoose";
import { UserSchema } from "../users/user.schema";

export const StructureSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  adresse: { type: String, default: "", required: true },
  adressePostale: { type: String, default: "" },
  complementAdresse: { type: String, default: "" },
  nom: { type: String, default: "", required: true },
  structureType: { type: String, default: "", required: true },
  ville: { type: String, default: "", required: true },
  departement: { type: String, default: "" },
  codePostal: { type: String, default: "", required: true },
  agrement: { type: String, default: "" },
  phone: { type: String, default: "", required: true },
  email: { type: String, default: "", required: true },
  responsable: {
    fonction: { type: String, default: "", required: true },
    nom: { type: String, default: "", required: true },
    prenom: { type: String, default: "", required: true }
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
});
