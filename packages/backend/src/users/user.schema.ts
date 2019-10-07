import * as mongoose from "mongoose";
import { User } from "./user.interface";
export const UserSchema = new mongoose.Schema({
  email: {
    required: true,
    type: String,
    unique: true
  },
  id: {
    type: Number,
    unique: true
  },
  nom: {
    required: true,
    type: String
  },
  password: {
    required: true,
    type: String
  },
  prenom: {
    required: true,
    type: String
  },
  role: {
    default: "simple",
    type: String
  },
  structure: {
    ref: "Structure",
    type: mongoose.Schema.Types.ObjectId
  },
  structureId: {
    required: true,
    type: Number
  },
  tokens: {
    email: {
      default: "",
      type: String
    },
    password: {
      default: "",
      type: String
    },
    passwordValidity: {
      type: Date
    }
  },
  verified: {
    default: false,
    type: Boolean
  }
});

UserSchema.pre<User>("save", function(next) {
  this.nom = this.nom.charAt(0).toUpperCase() + this.nom.slice(1);
  this.prenom = this.prenom.charAt(0).toUpperCase() + this.prenom.slice(1);
  this.email = this.email.toLowerCase();
  next();
});
