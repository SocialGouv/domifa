// tslint:disable: object-literal-sort-keys
import * as mongoose from "mongoose";
import { Usager } from "./interfaces/usagers";

export const UsagerSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },

  agent: String,
  structure: { type: Number, default: 2 },

  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  surnom: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  sexe: { type: String, required: true },

  contactPreference: String,
  dateNaissance: Date,
  villeNaissance: { type: String, required: true },

  ayantsDroits: { type: Array, default: [] },
  ayantsDroitsExist: Boolean,

  etapeDemande: {
    type: Number,
    default: 1,
    required: true
  },

  decision: {
    agent: String,
    dateDebut: Date,
    dateDemande: Date,
    dateFin: Date,
    dateInstruction: Date,
    motif: { type: String, default: "" },
    motifDetails: { type: String, default: "" },
    orientation: { type: String, default: "" },
    orientationDetails: { type: String, default: "" },
    statut: { type: String, default: "instruction" },

    userDecisionId: Number,
    userDecisionName: String,
    userInstructionId: Number,
    userInstructionName: String
  },

  historique: String,

  rdv: {
    dateRdv: Date,
    userId: Number,
    userName: String
  },

  entretien: {
    domiciliation: Boolean,
    liencommune: String,
    residence: String,
    residenceDetail: String,
    revenus: Boolean,
    cause: String,
    causeDetail: String,
    pourquoi: String,
    pourquoiDetail: String,
    accompagnement: Boolean,
    accompagnementDetail: String,
    commentaires: String
  },

  lastInteraction: {
    type: {
      nbCourrier: {
        type: Number,
        default: 0
      },
      courrierIn: {
        type: Date,
        default: null
      },
      courrierOut: {
        type: Date,
        default: null
      },
      recommandeIn: {
        type: Date,
        default: null
      },
      recommandeOut: {
        type: Date,
        default: null
      },
      appel: {
        type: Date,
        default: null
      },
      visite: {
        type: Date,
        default: null
      }
    },
    default: {
      nbCourrier: 0,
      courrierIn: null,
      courrierOut: null,
      recommandeIn: null,
      recommandeOut: null,
      appel: null,
      visite: null
    }
  },

  preference: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false }
  },

  interactions: [],
  docs: [],
  docsPath: []
});

UsagerSchema.pre<Usager>("save", function(next) {
  this.nom = this.nom.charAt(0).toUpperCase() + this.nom.slice(1);
  this.prenom = this.prenom.charAt(0).toUpperCase() + this.prenom.slice(1);
  next();
});
