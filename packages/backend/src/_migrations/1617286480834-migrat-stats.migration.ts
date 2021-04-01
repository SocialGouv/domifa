import moment = require("moment");
import { MigrationInterface, QueryRunner } from "typeorm";
import {
  structureRepository,
  structureStatsRepository,
  usagerRepository,
} from "../database";
import { appLogger } from "../util";
import { Structure } from "../_common/model";

export class manualMigration1617286480834 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP NEWS STATS - SEXE & RAISON `);

    const structuresIds: number[] = [];

    const structures: Pick<
      Structure,
      "id"
    >[] = await structureRepository.findMany(
      {},
      {
        select: ["id"],
      }
    );

    for (const structure of structures) {
      structuresIds.push(structure.id);
    }

    appLogger.debug(JSON.stringify(structuresIds));

    for (let j = 0; j < structuresIds.length; j++) {
      appLogger.debug(
        `[Migration][STATS-SEXE-RAISON] migrating Structure N* ${j}/${structuresIds.length} stats`
      );

      const stats = await structureStatsRepository.findMany({
        structureId: structures[j].id,
      });

      for (let i = 0; i < stats.length; i++) {
        if (i % 100 === 0) {
          appLogger.debug(
            `[Migration][STATS-SEXE-RAISON] migrating ${i}/${stats.length} stats`
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
