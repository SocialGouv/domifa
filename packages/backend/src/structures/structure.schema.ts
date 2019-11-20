import * as mongoose from "mongoose";
import { Structure } from "./structure-interface";

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
  import: {
    default: false,
    type: Boolean
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

StructureSchema.pre<Structure>("save", function(next) {
  this.adresse = this.adresse.charAt(0).toUpperCase() + this.adresse.slice(1);
  this.nom = this.nom.charAt(0).toUpperCase() + this.nom.slice(1);
  this.responsable.fonction =
    this.responsable.fonction.charAt(0).toUpperCase() +
    this.responsable.fonction.slice(1);
  this.responsable.nom =
    this.responsable.nom.charAt(0).toUpperCase() +
    this.responsable.nom.slice(1);
  this.responsable.prenom =
    this.responsable.prenom.charAt(0).toUpperCase() +
    this.responsable.prenom.slice(1);
  this.ville = this.ville.charAt(0).toUpperCase() + this.ville.slice(1);
  this.email = this.email.toLowerCase();
  next();
});
