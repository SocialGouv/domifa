import { Structure } from "../structure/Structure.type";
import { StructureStatsQuestionsAtDateValidUsagers } from "./StructureStatsQuestionsAtDateValidUsagers.type";
import { StructureStatsQuestionsInPeriodDecisions } from "./StructureStatsQuestionsInPeriodDecisions";
import { StructureStatsQuestionsInPeriodInteractions } from "./StructureStatsQuestionsInPeriodInteractions";

export type StructureStatsFull = {
  structure: Pick<Structure, "id" | "nom" | "importDate" | "registrationDate">;
  period: {
    startDateUTC: Date;
    endDateUTC: Date;
    endDateUTCExclusive: Date;
  };
  data: {
    validUsagers: StructureStatsQuestionsAtDateValidUsagers;
    decisions: StructureStatsQuestionsInPeriodDecisions;
    interactions: StructureStatsQuestionsInPeriodInteractions;
  };
};
