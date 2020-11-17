import * as mongoose from "mongoose";

export const InteractionSchema = new mongoose.Schema({
  content: String,
  dateInteraction: { type: Date, default: Date.now },
  nbCourrier: { type: Number, default: 1 },
  structureId: { type: Number, index: true, required: true },
  type: { type: String, required: true },
  usagerId: { type: Number, index: true, required: true },
  userId: Number,
  userName: String,
  migrated: { type: Boolean, default: false },
});
