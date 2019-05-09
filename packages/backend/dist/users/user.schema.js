"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.UserSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    email: String,
    firstName: String,
    lastName: String,
    password: String,
    phone: String,
    structure: { type: mongoose.Schema.Types.ObjectId, ref: 'Structure' },
    structureID: Number
});
//# sourceMappingURL=user.schema.js.map