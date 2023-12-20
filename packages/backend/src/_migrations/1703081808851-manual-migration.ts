/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";
import { usagerHistoryRepository } from "../database";
import { UsagerHistory } from "../_common/model";
import {
  getAyantsDroitForStats,
  getDecisionForStats,
  getEntretienForStats,
} from "../usagers/services";
import { appLogger } from "../util";

export class ManualMigration1703081808851 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    let cpt = 0;
    const total = await this.counteMigratedStats();
    while ((await this.counteMigratedStats()) > 0) {
      appLogger.info(`${cpt}/${total} history`);
      const usagerHistories: UsagerHistory[] =
        await usagerHistoryRepository.find({
          where: {
            migrated: false,
          },
          take: 1000,
        });

      await queryRunner.startTransaction();
      for (const usagerHistory of usagerHistories) {
        usagerHistory.import = usagerHistory?.import
          ? {
              createdAt: usagerHistory.createdAt,
            }
          : null;

        usagerHistory.states = usagerHistory.states.map((state: any) => {
          delete state.createdBy;

          return {
            ...state,
            decision: getDecisionForStats(state.decision as any),
            entretien: getEntretienForStats(state.entretien as any),
            ayantsDroits: getAyantsDroitForStats(state.ayantsDroits as any),
            rdv: { dateRdv: state?.rdv?.dateRdv },
          };
        });

        await usagerHistoryRepository.update(
          { uuid: usagerHistory.uuid },
          {
            states: usagerHistory.states,
            import: usagerHistory.import,
            migrated: true,
          }
        );
      }
      cpt = cpt + 1000;

      await queryRunner.commitTransaction();
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }

  private counteMigratedStats(): Promise<number> {
    return usagerHistoryRepository.countBy({ migrated: false });
  }
}
