// tslint:disable: object-literal-sort-keys
import * as mongoose from "mongoose";
import { InteractionSchema } from "../interactions/interaction.schema";
import { Usager } from "./interfaces/usagers";

export const UsagerSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },

  agent: String,
  structureId: { type: Number, required: true },

  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  surnom: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  sexe: { type: String, required: true },

  dateNaissance: { type: Date, required: true },
  villeNaissance: { type: String, required: true },

  ayantsDroits: { type: Array, default: [] },
  ayantsDroitsExist: Boolean,

  etapeDemande: {
    type: Number,
    default: 1,
    required: true
  },

  imported: { type: Boolean, default: false },

  decision: {
    dateDebut: {
      default: null,
      type: Date
    },
    dateDecision: Date,
    dateFin: {
      default: null,
      type: Date
    },
    datePremiere: {
      default: null,
      type: Date
    },
    motif: {
      default: "",
      type: String
    },
    motifDetails: {
      default: "",
      type: String
    },
    orientation: {
      default: "",
      type: String
    },
    orientationDetails: {
      default: "",
      type: String
    },
    statut: {
      default: "INSTRUCTION",
      type: String
    },
    typeDom: {
      default: "PREMIERE",
      type: String
    },
    userId: Number,
    userName: String
  },

  historique: { type: Array, default: [] },

  rdv: {
    dateRdv: { type: Date, default: null },
    userId: { type: Number, default: 0 },
    userName: { type: String, default: "" }
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

  interactions: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interaction"
      }
    ],
    default: []
  },
  docs: [],
  docsPath: []
});

UsagerSchema.pre<Usager>("save", function(next) {
  this.nom = this.nom.charAt(0).toUpperCase() + this.nom.slice(1);
  this.prenom = this.prenom.charAt(0).toUpperCase() + this.prenom.slice(1);
  next();
});
