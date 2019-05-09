import { Document } from 'mongoose';

export interface User extends Document {

  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  structureID: number;
  structure: any;
}
