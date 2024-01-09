/* eslint-disable @typescript-eslint/no-unused-vars */
import { In, MigrationInterface, QueryRunner } from "typeorm";
import { UsagerHistory, UsagerHistoryState } from "../_common/model";
import { usagerHistoryRepository } from "../database";
import { getHistoryEndDateFromNextBeginDate } from "../usagers/services";

export class UpdateEndDateHistoryMigration1704813169210
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const total = await this.countHistoriesToMigrate();

    console.log(total);

    for (let cpt = 0; cpt <= total; cpt = cpt + 2000) {
      console.log(`${cpt}/${total} migrated`);
      const usagerHistories: UsagerHistory[] =
        await usagerHistoryRepository.find({
          where: { migrated: false },
          order: {
            structureId: "DESC",
            usagerRef: "DESC",
          },
          take: 2000,
        });

      await queryRunner.startTransaction();
      const uuidsToUpdate = [];
      for (const history of usagerHistories) {
        let needUdpate = false;

        const states: UsagerHistoryState[] = history.states;

        for (let i = 0; i < states.length - 1; i++) {
          const state = states[i];

          const nextState = states[i + 1];
          if (typeof nextState !== "undefined" && !state?.historyEndDate) {
            needUdpate = true;
            states[i].historyEndDate = getHistoryEndDateFromNextBeginDate(
              nextState.historyBeginDate
            );
            console.log({
              structureId: history.structureId,
              usagerRef: history.usagerRef,
              historyBeginDate: state.historyBeginDate,
              historyEndDate: state.historyEndDate,
              NewHistoryEndDate: states[i].historyEndDate,
            });
            console.log();
          }
        }

        if (needUdpate) {
          await usagerHistoryRepository.update(
            { uuid: history.uuid },
            { states: history.states }
          );
        }

        uuidsToUpdate.push(history.uuid);
      }

      await usagerHistoryRepository.update(
        { uuid: In(uuidsToUpdate) },
        { migrated: true }
      );
      await queryRunner.commitTransaction();
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }

  private countHistoriesToMigrate(): Promise<number> {
    return usagerHistoryRepository.countBy({ migrated: false });
  }
}
