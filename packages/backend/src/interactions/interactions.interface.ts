import { Document } from "mongoose";
import { InteractionType } from "../_common/model/interaction";
export interface InteractionDocument extends Document {
  type: InteractionType;
  dateInteraction: Date;
  content?: string;
  nbCourrier?: number;
  usagerId: number;
  structureId: number;
  userName?: string;
  userId: number;
  migrated?: boolean;
}
