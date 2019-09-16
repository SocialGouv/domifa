import * as mongoose from "mongoose";

export const StructureSchema = new mongoose.Schema({
  adresse: {
    default: "",
    required: true,
    type: String
  },
  adressePostale: {
    default: "",
    type: String
  },
  agrement: {
    default: "",
    type: String
  },
  capacite: {
    type: Number
  },
  codePostal: {
    default: "",
    required: true,
    type: String
  },
  complementAdresse: {
    default: "",
    type: String
  },
  departement: {
    default: "",
    type: String
  },
  email: {
    default: "",
    required: true,
    type: String
  },
  id: {
    type: Number,
    unique: true
  },
  nom: {
    default: "",
    required: true,
    type: String
  },
  phone: {
    default: "",
    required: true,
    type: String
  },
  responsable: {
    fonction: {
      default: "",
      required: true,
      type: String
    },
    nom: {
      default: "",
      required: true,
      type: String
    },
    prenom: {
      default: "",
      required: true,
      type: String
    }
  },
  structureType: {
    default: "",
    required: true,
    type: String
  },
  token: {
    default: "",
    type: String
  },
  users: [
    {
      ref: "User",
      type: mongoose.Schema.Types.ObjectId
    }
  ],
  verified: {
    default: false,
    type: Boolean
  },
  ville: {
    default: "",
    required: true,
    type: String
  }
});
