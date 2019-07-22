// tslint:disable: object-literal-sort-keys

import * as mongoose from "mongoose";
import { StructureSchema } from "../structures/structure.schema";

export const UserSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  email: { type: String, unique: true, required: true },
  prenom: { type: String, required: true },
  nom: { type: String, required: true },
  password: { type: String, required: true },
  structure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Structure"
  },
  structureId: { type: Number, required: true }
});
