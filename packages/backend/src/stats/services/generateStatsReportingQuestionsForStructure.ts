import { Structure, StructureStatsReportingQuestions } from "@domifa/common";

export const generateStatsReportingQuestionsForStructure = async (
  structure: Pick<Structure, "id">
) => {
  const statsToImport = [];

  for (let i = 2020; i < new Date().getFullYear(); i++) {
    const statsReporting = new StructureStatsReportingQuestions({
      structureId: structure.id,
      year: i,
      workers: null,
      volunteers: null,
      humanCosts: null,
      totalCosts: null,
      completedBy: null,
      waitingList: null,
      waitingTime: null,
      confirmationDate: null,
    });
    statsToImport.push(statsReporting);
  }
  return statsToImport;
};
