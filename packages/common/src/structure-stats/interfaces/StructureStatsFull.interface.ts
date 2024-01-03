import { type Structure } from "../../structure";
import { type StructureStatsQuestionsAtDateValidUsagers } from "./StructureStatsQuestionsAtDateValidUsagers.interface";
import { type StructureStatsQuestionsInPeriodDecisions } from "./StructureStatsQuestionsInPeriodDecisions.interface";
import { type StructureStatsQuestionsInPeriodInteractions } from "./StructureStatsQuestionsInPeriodInteractions.interface";

export interface StructureStatsFull {
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
}
