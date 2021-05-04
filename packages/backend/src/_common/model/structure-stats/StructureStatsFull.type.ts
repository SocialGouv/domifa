import { StructureStats } from "./StructureStats.type";
import { StructureStatsQuestionsAtDate } from "./StructureStatsQuestionsAtDate.type";
import { StructureStatsQuestionsInPeriod } from "./StructureStatsQuestionsInPeriod";

export type StructureStatsFull = StructureStats & {
  questions: StructureStatsQuestionsAtDate & StructureStatsQuestionsInPeriod;
};
