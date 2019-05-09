"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
mongoose.set('debug', true);
exports.UsagerSchema = new mongoose.Schema({
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
    dateFin: Date,
    decision: {
        dateDebut: Date,
        dateFin: Date,
        statut: String,
        motif: Number,
        agent: String,
        motifDetails: String,
        orientation: Number,
        orientationDetails: String
    },
    historique: String,
    rdv: {
        dateRdv: Date,
        userId: Number,
        userName: String,
    },
    preference: {
        mail: Boolean,
        phone: Boolean
    },
    docs: [],
    docsPath: []
});
//# sourceMappingURL=usager.schema.js.map