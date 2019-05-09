import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  email: String,
  firstName: String,
  lastName: String,
  password: String,
  phone: String,
  structure : {type: mongoose.Schema.Types.ObjectId, ref: 'Structure'},
  structureID: Number
});
