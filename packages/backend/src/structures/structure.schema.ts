import * as mongoose from "mongoose";
import { Structure } from "./structure-interface";

export const StructureSchema = new mongoose.Schema(
  {
    adresse: {
      default: "",
      required: true,
      type: String,
      trim: true,
    },
    adresseCourrier: {
      actif: { type: Boolean, default: false },
      adresse: { type: String, default: "" },
      ville: { type: String, default: "" },
      codePostal: { type: String, default: "" },
    },
    agrement: {
      default: "",
      type: String,
      trim: true,
    },
    capacite: {
      type: Number,
    },
    codePostal: {
      default: "",
      required: true,
      trim: true,
      type: String,
    },
    complementAdresse: {
      default: "",
      type: String,
    },
    departement: {
      default: "",
      type: String,
    },
    region: {
      default: "",
      type: String,
    },
    email: {
      default: "",
      required: true,
      type: String,
    },
    hardReset: {
      select: false,
      type: {
        expireAt: {
          type: Date,
        },
        token: {
          default: "",
          type: String,
        },
        userId: {
          type: String,
        },
      },
    },
    tokenDelete: {
      select: false,
      type: String,
      default: "",
    },
    id: {
      index: true,
      type: Number,
      unique: true,
    },
    import: {
      default: false,
      type: Boolean,
    },
    importDate: {
      type: Date,
    },
    lastExport: { type: Date, default: null },
    lastLogin: { type: Date, default: null },
    nom: {
      default: "",
      required: true,
      trim: true,
      type: String,
    },
    options: {
      numeroBoite: { type: Boolean, default: false },
    },
    phone: {
      default: "",
      required: true,
      trim: true,
      type: String,
    },
    responsable: {
      fonction: {
        default: "",
        required: true,
        trim: true,
        type: String,
      },
      nom: {
        default: "",
        required: true,
        trim: true,
        type: String,
      },
      prenom: {
        default: "",
        required: true,
        type: String,
      },
    },
    stats: {
      default: {
        VALIDE: 0,
        REFUS: 0,
        RADIE: 0,
        TOTAL: 0,
      },
      type: {
        VALIDE: Number,
        REFUS: Number,
        RADIE: Number,
        TOTAL: Number,
      },
      select: false,
    },
    structureType: {
      default: "",
      required: true,
      type: String,
    },
    token: {
      default: "",
      type: String,
    },
    usersCount: {
      default: 0,
      type: Number,
    },
    verified: {
      default: false,
      type: Boolean,
    },
    ville: {
      default: "",
      required: true,
      trim: true,
      type: String,
    },
    migrated: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

StructureSchema.pre<Structure>("save", function (next) {
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
