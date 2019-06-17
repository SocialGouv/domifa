// tslint:disable: object-literal-sort-keys
import * as mongoose from "mongoose";
mongoose.set("debug", true);

export const InteractionSchema = new mongoose.Schema({
  type: String,
  date: Date,
  nbCourrier: Number,
  content: String,
  userId: Number,
  userName: String
});
