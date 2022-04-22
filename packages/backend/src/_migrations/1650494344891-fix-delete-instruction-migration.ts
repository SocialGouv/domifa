/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { UsagerHistory } from "../_common/model/usager/history/UsagerHistory.type";
import { MigrationInterface, QueryRunner } from "typeorm";
import { usagerHistoryRepository } from "../database";
import { appLogger } from "../util";

export class fixDeleteInstructionMigration1650494327593
  implements MigrationInterface
{
  name = "fixDeleteInstructionMigration1650494327593";

  public async up(): Promise<void> {
    appLogger.warn(
      "[MIGRATION] Nettoyage de données supprimées dans la DB usager_history"
    );
    const usagersHistory: UsagerHistory[] = await (
      await usagerHistoryRepository.typeorm()
    ).query(
      `select *
        from usager_history uh join jsonb_array_elements(uh.states) as state on true
        AND (state->>'createdEvent')::text = 'delete-decision' AND (state->'decision'->>'statut')::text = 'INSTRUCTION'`
    );

    appLogger.warn(
      `[MIGRATION] [FIX INSTRUCTION HISTORY] ${usagersHistory.length} dossiers avec un valide supprimé à nettoyer`
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
      console.log("");
      console.log("");
      console.log("> BEFORE " + decisions.length + " - " + history.usagerUUID);

      console.table(decisions);
      history.states = history.states.filter(
        (state) =>
          !(
            state.createdEvent === "delete-decision" &&
            state.decision.statut === "INSTRUCTION"
          )
      );

      // Mise à jour du End Date :
      if (
        history.states[history.states.length - 1].decision.statut ===
        "INSTRUCTION"
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
      console.log("> AFTER " + decisions.length + " - " + history.usagerUUID);

      console.table(decisions);

      //Update de l'historique
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

    const usagersHistoryAfter: UsagerHistory[] = await (
      await usagerHistoryRepository.typeorm()
    ).query(
      `select *
        from usager_history uh join jsonb_array_elements(uh.states) as state on true
        AND (state->>'createdEvent')::text = 'delete-decision' AND (state->'decision'->>'statut')::text = 'INSTRUCTION'`
    );

    appLogger.warn(
      `[MIGRATION] [AFTER] ${usagersHistoryAfter.length} dossiers avec un valide supprimé à nettoyer`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
