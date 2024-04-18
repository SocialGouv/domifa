import {
  StructureStatsQuestionsInPeriodInteractions,
  Usager,
} from "@domifa/common";

export type StructureUsagersExportModel = {
  exportDate: Date;
  usagers: Usager[];
  usagersInteractionsCountByType: {
    [usagerRef: number]: StructureStatsQuestionsInPeriodInteractions;
  };
};
