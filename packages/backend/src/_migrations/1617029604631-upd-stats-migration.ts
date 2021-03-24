import moment = require("moment");
import { MigrationInterface, QueryRunner } from "typeorm";
import { structureStatsRepository, usagerRepository } from "../database";
import { appLogger } from "../util";

export class manualMigration1617029604631 implements MigrationInterface {
  name = "manualMigration1617029604631";
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP "${this.name}"`);

    const stats = await structureStatsRepository.findMany({});
    for (let i = 0; i < stats.length; i++) {
      if (i % 100 === 0) {
        appLogger.debug(
          `[Migration][${this.name}] migrating ${i}/${stats.length} stats`
        );
      }
      const stat = stats[i];
      // End of stat day
      const statsDateEndOfDayUTC = moment
        .utc(stat.date)
        .endOf("day")
        .subtract(1, "minute")
        .toDate();
      stat.questions.Q_21.RAISON_DEMANDE = await usagerRepository.countByRaisonDemande(
        {
          structureId: stat.structureId,
          actifsInHistoryBefore: statsDateEndOfDayUTC,
        }
      );
      stat.questions.USAGERS = {
        SEXE: await usagerRepository.countBySexe({
          structureId: stat.structureId,
          actifsInHistoryBefore: statsDateEndOfDayUTC,
        }),
        TRANCHE_AGE: await usagerRepository.countByTranchesAge({
          structureId: stat.structureId,
          actifsInHistoryBefore: statsDateEndOfDayUTC,
          ageReferenceDate: statsDateEndOfDayUTC,
        }),
      };
      await structureStatsRepository.save(stat);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
