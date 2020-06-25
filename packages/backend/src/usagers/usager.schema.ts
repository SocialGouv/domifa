import * as mongoose from "mongoose";
import { Usager } from "./interfaces/usagers";

export const UsagerSchema = new mongoose.Schema(
  {
    ayantsDroits: {
      default: [],
      type: Array,
    },
    customId: {
      maxlength: 30,
      type: String,
      trim: true,
    },
    dateNaissance: {
      required: true,
      type: Date,
    },
    datePremiereDom: {
      default: null,
      type: Date,
    },
    decision: {
      dateDebut: {
        type: Date,
      },
      dateDecision: {
        default: Date.now,
        type: Date,
      },
      dateFin: {
        default: Date.now,
        type: Date,
      },
      motif: {
        type: String,
        trim: true,
      },
      motifDetails: {
        maxlength: 300,
        trim: true,
        type: String,
      },
      orientation: {
        type: String,
        trim: true,
      },
      orientationDetails: {
        default: null,
        maxlength: 200,
        trim: true,
        type: String,
      },
      statut: {
        default: "INSTRUCTION",
        index: true,
        type: String,
      },
      userId: Number,
      userName: String,
    },
    docs: [],
    docsPath: [],
    email: {
      default: "",
      maxlength: 200,
      trim: true,
      type: String,
    },
    entretien: {
      default: {
        accompagnement: null,
        accompagnementDetail: null,
        cause: null,
        causeDetail: null,
        commentaires: null,
        domiciliation: null,
        liencommune: null,
        pourquoi: null,
        pourquoiDetail: null,
        raison: null,
        raisonDetail: null,
        residence: null,
        residenceDetail: null,
        revenus: null,
        revenusDetail: null,
        typeMenage: null,
      },
      type: {
        accompagnement: {
          default: null,
          type: Boolean,
        },
        accompagnementDetail: {
          default: null,
          maxlength: 300,
          trim: true,
          type: String,
        },
        cause: {
          default: null,
          type: String,
        },
        causeDetail: {
          default: null,
          maxlength: 300,
          trim: true,
          type: String,
        },
        commentaires: {
          default: null,
          maxlength: 1000,
          trim: true,
          type: String,
        },
        domiciliation: {
          default: null,
          type: Boolean,
        },
        liencommune: {
          default: null,
          maxlength: 300,
          trim: true,
          type: String,
        },
        orientation: {
          default: null,
          type: Boolean,
        },
        orientationDetail: {
          default: null,
          maxlength: 300,
          trim: true,
          type: String,
        },
        pourquoi: {
          default: null,
          type: String,
        },
        pourquoiDetail: {
          default: null,
          maxlength: 300,
          trim: true,
          type: String,
        },
        raison: {
          default: null,
          type: Boolean,
        },
        raisonDetail: {
          default: null,
          maxlength: 300,
          trim: true,
          type: String,
        },
        residence: {
          default: null,
          type: String,
        },
        residenceDetail: {
          default: null,
          maxlength: 300,
          trim: true,
          type: String,
        },
        typeMenage: {
          default: null,
          type: String,
        },
      },
    },
    etapeDemande: {
      default: 1,
      required: true,
      type: Number,
    },
    historique: {
      default: [],
      type: Array,
    },
    id: {
      index: true,
      type: Number,
    },
    interactions: {
      default: [],
      type: [
        {
          ref: "Interaction",
          type: mongoose.Schema.Types.ObjectId,
        },
      ],
    },
    lastInteraction: {
      colisIn: {
        default: 0,
        type: Number,
      },
      courrierIn: {
        default: 0,
        type: Number,
      },
      dateInteraction: {
        default: Date.now,
        type: Date,
      },
      enAttente: {
        default: false,
        type: Boolean,
      },
      recommandeIn: {
        default: 0,
        type: Number,
      },
    },
    migration: {
      default: false,
      type: Boolean,
    },
    nom: {
      index: true,
      maxlength: 200,
      required: true,
      trim: true,
      type: String,
    },
    options: {
      npai: {
        actif: {
          default: false,
          type: Boolean,
        },
        dateDebut: {
          type: Date,
        },
      },
      procuration: {
        actif: {
          default: false,
          type: Boolean,
        },
        dateDebut: {
          type: Date,
        },
        dateFin: {
          type: Date,
        },
        dateNaissance: {
          type: String,
        },
        nom: {
          type: String,
        },
        prenom: {
          type: String,
        },
      },
      transfert: {
        actif: {
          default: false,
          type: Boolean,
        },
        adresse: {
          default: null,
          type: String,
        },
        dateDebut: {
          type: Date,
        },
        dateFin: {
          type: Date,
        },
        nom: {
          default: null,
          type: String,
        },
      },
    },
    phone: {
      default: "",
      maxlength: 12,
      trim: true,
      type: String,
    },
    preference: {
      email: {
        default: false,
        type: Boolean,
      },
      phone: {
        default: false,
        type: Boolean,
      },
    },
    prenom: {
      index: true,
      maxlength: 200,
      required: true,
      trim: true,
      type: String,
    },
    rdv: {
      dateRdv: {
        default: null,
        type: Date,
      },
      userId: {
        default: 0,
        type: Number,
      },
      userName: {
        default: "",
        type: String,
      },
    },
    sexe: {
      required: true,
      type: String,
    },
    structureId: {
      index: true,
      required: true,
      type: Number,
    },
    suivi: {
      default: {},
      type: {
        _id: {
          ref: "User",
          type: mongoose.Schema.Types.ObjectId,
        },
        userName: {
          type: String,
        },
      },
    },
    surnom: {
      default: "",
      maxlength: 200,
      trim: true,
      type: String,
    },
    typeDom: {
      default: "PREMIERE",
      index: true,
      type: String,
    },
    villeNaissance: {
      maxlength: 200,
      required: true,
      trim: true,
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UsagerSchema.pre<Usager>("save", function (next) {
  this.nom = this.nom.charAt(0).toUpperCase() + this.nom.slice(1);
  this.prenom = this.prenom.charAt(0).toUpperCase() + this.prenom.slice(1);
  this.email = this.email.toLowerCase();
  next();
});
