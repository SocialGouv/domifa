// tslint:disable: object-literal-sort-keys

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

  contactPreference: String,
  dateNaissance: Date,
  villeNaissance: String,

  ayantsDroits: [],
  ayantsDroitsExist: Boolean,

  etapeDemande: Number,

  decision: {
    agent : String,
    dateDebut: Date,
    dateDemande: Date,
    dateFin: Date,
    dateInstruction: Date,
    motif: String,
    motifDetails: String,
    orientation: String,
    orientationDetails: String,
    statut: String,
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


  lastInteraction: {
    nbCourrier: Number,
    courrierIn: Date,
    courrierOut: Date,
    recommandeIn: Date,
    recommandeOut: Date,
    appel: Date,
    visite: Date,
  },


  preference : {
    mail: Boolean,
    phone: Boolean
  },

  docs: [],
  docsPath: []
});
