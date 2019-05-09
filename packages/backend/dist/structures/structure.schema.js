"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.StructureSchema = new mongoose.Schema({
    id: Number,
    adresse: String,
    complementAdresse: String,
    nom: String,
    structureType: Number,
    ville: String,
    departement: String,
    codePostal: String,
    agrement: String,
    password: String,
    phone: String,
    mail: String,
    responsable: {
        fonction: String,
        nom: String,
        prenom: String,
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});
//# sourceMappingURL=structure.schema.js.map