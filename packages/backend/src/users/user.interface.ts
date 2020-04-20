import { Document } from "mongoose";
import { Structure } from "../structures/structure-interface";

export interface User extends Document {
  id: number;
  prenom: string;
  nom: string;
  phone: string;
  email: string;
  password: string;
  structureId: number;
  fonction: string;
  structure: Structure;
  role: string;
  verified: boolean;
  lastLogin: Date;
  tokens: {
    password: string;
    passwordValidity: Date;
  };
}
