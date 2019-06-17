import { Document } from "mongoose";

export interface User extends Document {
  id: number;
  prenom: string;
  nom: string;
  phone: string;
  email: string;
  password: string;
  structureId: number;
  structure: any;
}
