import { ObjectID } from 'bson';
import * as mongoose from 'mongoose';
mongoose.set('debug', true);

export const UsagerSchema = new mongoose.Schema({

  id: {
    type: Number,
    unique: true
  },

  agent: String,
  structure: String,

  nom: String,
  prenom: String,
  email: String,
  phone: String,
  sexe: String,

  codePostalNaissance: String,
  contactPreference: String,
  dateNaissance: Date,
  villeNaissance: String,

  ayantsDroits: [],
  ayantsDroitsExist: Boolean,

  etapeDemande: Number,
  statutDemande: String,
  dateDemande: Date,

  decision: {
    dateDebut: Date,
    dateFin: Date,
    statut: String,
    motif: String,
    agent : String,
    motifDetails: String,
    orientation: String,
    orientationDetails: String
  },

  historique: String,

  rdv: {
    dateRdv: Date,
    userId: Number,
    userName: String,
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
    commentaires: String,
  },

  preference : {
    mail: Boolean,
    phone: Boolean
  },

  docs: [],
  docsPath: []
});
