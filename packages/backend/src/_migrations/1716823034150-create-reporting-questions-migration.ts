import { MigrationInterface } from "typeorm";
import {
  structureRepository,
  structureStatsReportingQuestionsRepository,
} from "../database";
import { appLogger } from "../util";
import { generateStatsReportingQuestionsForStructure } from "../stats/services";

export class GenerateStatsReportingMigration1716823034150
  implements MigrationInterface
{
  public async up(): Promise<void> {
    appLogger.info(`[MIGRATION] Create stats reporting for structures`);
    const structures = await structureRepository.find({ select: ["id"] });
    for (const structure of structures) {
      const statsToImport = await generateStatsReportingQuestionsForStructure(
        structure
      );
      appLogger.info(`[MIGRATION] Create stats reporting for ${structure.id} `);
      await structureStatsReportingQuestionsRepository.insert(statsToImport);
    }
  }

  public async down(): Promise<void> {}
}
