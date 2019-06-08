import { Document } from 'mongoose';
import { TypeInteraction } from './interactions.enum';

export interface Interaction extends Document {
  type: TypeInteraction;
  dateInteraction: Date;
  content?: string;
  nbCourrier?: number;
  userName?: string;
  userId: number
}
