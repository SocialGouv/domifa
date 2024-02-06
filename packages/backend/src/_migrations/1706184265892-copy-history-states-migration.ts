import { UsagerHistoryState } from "./../_common/model/usager/history/UsagerHistoryState.type";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";
import {
  usagerHistoryRepository,
  usagerHistoryStatesRepository,
} from "../database";
import { UsagerHistoryStatesTable } from "../database/entities/usager/UsagerHistoryStatesTable.typeorm";
import { UsagerDecision, UsagerEntretien } from "@domifa/common";
import { getDecisionForStats, getEntretienForStats } from "../usagers/services";
import { domifaConfig } from "../config";

export class MigrateStatsMigration1706184265892 implements MigrationInterface {
  name = "MigrateStatsMigration1706184265892";

  public async up(_queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      const total = await this.countHistoriesToMigrate();
      console.log({ total });

      let cpt = 0;
      while ((await this.countHistoriesToMigrate()) > 0) {
        await _queryRunner.startTransaction();
        cpt += 250;
        console.log(`${cpt}/${total} histories - ${new Date()}`);
        const histories = await usagerHistoryRepository.find({
          where: { migrated: false },
          take: 250,
          order: { structureId: "ASC" },
        });

        for (const history of histories) {
          for (const state of history.states) {
            if (!state?.createdAt || !state?.historyBeginDate) {
              console.log({
                historyBeginDate: state?.historyBeginDate,
                createdAt: state?.createdAt,
                uuid: history.uuid,
              });
              continue;
            }

            const decision: Partial<UsagerDecision> = getDecisionForStats(
              state.decision as UsagerDecision
            );

            const entretien: Partial<UsagerEntretien> = getEntretienForStats(
              state.entretien as UsagerEntretien
            );

            let typeDom = state?.typeDom ?? state?.decision?.typeDom;

            if (!typeDom) {
              typeDom = "PREMIERE_DOM";
            }

            const newHistory = new UsagerHistoryStatesTable({
              createdAt: state?.createdAt ?? state.historyBeginDate,
              usagerRef: history.usagerRef,
              usagerUUID: history.usagerUUID,
              structureId: history.structureId,
              etapeDemande: state.etapeDemande,
              typeDom,
              ayantsDroits: state.ayantsDroits,
              decision: decision,
              entretien: entretien,
              rdv: state.rdv,
              createdEvent: state.createdEvent,
              historyBeginDate: state.historyBeginDate,
              historyEndDate: state.historyEndDate,
              isActive: state.isActive,
            });

            await usagerHistoryStatesRepository.save(newHistory);
          }

          history.states = history.states.map((state: UsagerHistoryState) => {
            return {
              ...state,
              decision: getDecisionForStats(state.decision as UsagerDecision),
              entretien: getEntretienForStats(
                state.entretien as UsagerEntretien
              ),
            };
          });

          await usagerHistoryRepository.update(
            { uuid: history.uuid },
            {
              migrated: true,
              states: history.states,
            }
          );
        }

        await _queryRunner.commitTransaction();
      }
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }

  private countHistoriesToMigrate(): Promise<number> {
    return usagerHistoryRepository.countBy({ migrated: false });
  }
}
