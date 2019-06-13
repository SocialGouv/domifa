// tslint:disable: object-literal-sort-keys

import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  email: { type: String, unique: true, required: true },
  prenom: String,
  nom: String,
  password: String,
  phone: String,
  structure : {type: mongoose.Schema.Types.ObjectId, ref: 'Structure'},
  structureId: Number
});
