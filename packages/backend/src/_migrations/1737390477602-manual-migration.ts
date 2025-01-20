import { IsNull, MigrationInterface } from "typeorm";
import { structureStatsReportingQuestionsRepository } from "../database";
import { domifaConfig } from "../config";

export class ManualMigration1737390477602 implements MigrationInterface {
  public async up(): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      console.log("Delete useless data in questions");
      await structureStatsReportingQuestionsRepository.delete({
        confirmationDate: IsNull(),
      });
    }
  }

  public async down(): Promise<void> {}
}
