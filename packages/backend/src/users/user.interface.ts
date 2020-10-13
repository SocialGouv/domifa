import { Document } from "mongoose";
import { Structure } from "../structures/structure-interface";
import { UserRole } from "./user-role.type";

export interface User extends Document {
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
