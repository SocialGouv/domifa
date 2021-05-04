import { StructureStatsQuestionsAtDate } from "./StructureStatsQuestionsAtDate.type";
import { StructureStatsQuestionsInPeriod } from "./StructureStatsQuestionsInPeriod";

export type StructureStatsQuestions = StructureStatsQuestionsAtDate &
  StructureStatsQuestionsInPeriod;
