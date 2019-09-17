import { Document } from "mongoose";

export interface Interaction extends Document {
  type: string;
  dateInteraction: Date;
  content?: string;
  nbCourrier?: number;
  usagerId: number;
  structureId: number;
  userName?: string;
  userId: number;
}
