import { Document } from "mongoose";
import { Structure } from "../structures/structure-interface";
import { UserRole } from "../_common/model";

export interface User extends Document {
  // _id: any;
  id: number;
  prenom: string;
  nom: string;
  phone: string;
  email: string;
  password: string;
  structureId: number;
  fonction?: string;
  structure: Structure;
  role: UserRole;
  verified: boolean;
  lastLogin: Date;

  passwordLastUpdate: Date;

  tokens: {
    creation?: string;
    password?: string;
    passwordValidity?: Date;
  };
}
