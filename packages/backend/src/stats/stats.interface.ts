import { Document } from "mongoose";
import { Stats } from "./stats.class";

export interface StatsDocument extends Stats, Document {}
