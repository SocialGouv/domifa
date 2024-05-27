import { StructureStatsReportingQuestions } from "@domifa/common";

import { StructureStatsReportingQuestionsTable } from "../../entities";
import { myDataSource } from "../_postgres";

export const structureStatsReportingQuestionsRepository =
  myDataSource.getRepository<StructureStatsReportingQuestions>(
    StructureStatsReportingQuestionsTable
  );
