import { Document } from 'mongoose';

enum TypeInteraction {
  courrierIn,
  courrierOut,
  recommandeIn,
  recommandeOut,
  appel,
  visite
}

export interface Interaction extends Document {
  type: TypeInteraction;
  dateInteraction: Date;
  content?: string;
  nbre?: number;
  userName?: string;
  userId: number
}
