/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { UsagerHistory } from "../_common/model/usager/history/UsagerHistory.type";
import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { usagerHistoryRepository } from "../database";
import { appLogger } from "../util";

export class fixDeleteRefusMigration1650494327593
  implements MigrationInterface
{
  name = "fixDeleteRefusMigration1650494327593";

  public async up(): Promise<void> {
    appLogger.warn(
      "[MIGRATION] Nettoyage de données supprimées dans la DB usager_history"
    );
    const usagersHistory: UsagerHistory[] = await (
      await usagerHistoryRepository.typeorm()
    ).query(
      `select *
        from usager_history uh join jsonb_array_elements(uh.states) as state on true
        AND (state->>'createdEvent')::text = 'delete-decision' AND ((state->'decision'->>'statut')::text = 'REFUS' OR (state->'decision'->>'statut')::text = 'RADIE')`
    );

    appLogger.warn(
      `[MIGRATION] [FIX PREMIERE_DOM] ${usagersHistory.length} dossiers avec un refus / radié supprimé à mettre à jour`
    );
    // Correction des datas obsolètes de l'historique des premieres dom
    for (const history of usagersHistory) {
      let decisions = [];

      // DISPLAY BEFORE AND CLEAN
      for (let i = 0; i < history.states.length; i++) {
        const state = history.states[i];

        decisions.push({
          event: state.createdEvent,
          statut: state.decision.statut,
          historyBeginDate: state.historyBeginDate,
          historyEndDate: state.historyEndDate,
        });
      }
      // console.log("");
      // console.log("");
      // console.log("> BEFORE " + history.usagerUUID);
      // console.table(decisions);
      // console.log("> AFTER ");

      history.states = history.states.filter(
        (state) =>
          !(
            state.createdEvent === "delete-decision" &&
            (state.decision.statut === "REFUS" ||
              state.decision.statut === "RADIE")
          )
      );

      // Mise à jour du End Date :
      if (
        history.states[history.states.length - 1].decision.statut === "REFUS" ||
        history.states[history.states.length - 1].decision.statut === "RADIE"
      ) {
        delete history.states[history.states.length - 1].historyEndDate;
      }

      // DISPLAY AFTER CLEAN
      decisions = [];

      for (let i = 0; i < history.states.length; i++) {
        const state = history.states[i];
        decisions.push({
          event: state.createdEvent,
          statut: state.decision.statut,
          historyBeginDate: state.historyBeginDate,
          historyEndDate: state.historyEndDate,
        });
      }
      // console.table(decisions);

      // Update de l'historique
      await (
        await usagerHistoryRepository.typeorm()
      ).update(
        {
          uuid: history.uuid,
        },
        {
          states: history.states,
        }
      );
    }

    appLogger.warn(
      `[MIGRATION] [DOSSIERS SUPPRIMES REFUS] ${usagersHistory.length} dossiers avec un refus / radié supprimé à mettre à jour`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
