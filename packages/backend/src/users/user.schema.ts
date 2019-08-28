import * as mongoose from "mongoose";
import { StructureSchema } from "../structures/structure.schema";
export const UserSchema = new mongoose.Schema({
  email: {
    required: true,
    type: String,
    unique: true
  },
  id: {
    type: Number,
    unique: true
  },
  nom: {
    required: true,
    type: String
  },
  password: {
    required: true,
    type: String
  },
  prenom: {
    required: true,
    type: String
  },
  role: {
    default: "simple",
    type: String
  },
  structure: {
    ref: "Structure",
    type: mongoose.Schema.Types.ObjectId
  },
  structureId: {
    required: true,
    type: Number
  },
  tokens: {
    email: {
      default: "",
      type: String,
      unique: true
    },
    password: {
      default: "",
      type: String,
      unique: true
    },
    passwordValidity: {
      type: Date
    }
  },
  verified: {
    default: false,
    type: Boolean
  }
});
