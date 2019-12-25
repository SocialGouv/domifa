import * as mongoose from "mongoose";

export const InteractionSchema = new mongoose.Schema({
  content: String,
  dateInteraction: { type: Date, default: Date.now },
  nbCourrier: Number,
  structureId: Number,
  type: String,
  usagerId: { type: Number, index: true },
  userId: Number,
  userName: String
});
