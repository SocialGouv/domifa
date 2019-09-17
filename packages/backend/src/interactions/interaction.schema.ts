import * as mongoose from "mongoose";

export const InteractionSchema = new mongoose.Schema({
  content: String,
  dateInteraction: Date,
  nbCourrier: Number,
  structureId: Number,
  type: String,
  usagerId: Number,
  userId: Number,
  userName: String
});
