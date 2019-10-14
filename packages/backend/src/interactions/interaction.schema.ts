import * as mongoose from "mongoose";

export const InteractionSchema = new mongoose.Schema({
  content: String,
  dateInteraction: { type: Date, default: Date.now },
  nbCourrier: Number,
  structureId: Number,
  type: String,
  usagerId: Number,
  userId: Number,
  userName: String
});
