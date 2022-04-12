import { format } from "date-fns";
import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { usagerHistoryRepository, usagerRepository } from "../database";
import { appLogger } from "../util";
import { UsagerHistory, Usager } from "../_common/model";

export class manualMigration1649680803408 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      // const usagers: Usager[] = await (
      //   await usagerRepository.typeorm()
      // ).query(
      //   `select * from usager u where "datePremiereDom" IS null AND "typeDom" is  null`
      // );
      const usagersHistory: UsagerHistory[] = await (
        await usagerHistoryRepository.typeorm()
      ).query(
        `select "usagerUUID", states from  usager_history uh where EXISTS (
          SELECT TRUE
          FROM jsonb_array_elements(states) x
          WHERE x->>'createdEvent' IN ('delete-decision'))`
      );

      const updated = [];
      const notUpdated = [];

      for (const usagerHistory of usagersHistory) {
        const usager: Usager = await (
          await usagerRepository.typeorm()
        ).findOne({ uuid: usagerHistory.usagerUUID });

        const historique = usagerHistory.states.filter(
          (state) =>
            state.createdEvent === "new-decision" ||
            state.createdEvent === "delete-decision"
        );

        console.log();
        console.log("UUID - " + usager.uuid + " : " + usager?.import?.date);
        console.log("STATES HISTORIQUE - " + historique.length);
        for (const inStates of historique) {
          console.log(
            " ---> " +
              inStates.createdEvent +
              " \t" +
              inStates.decision.statut +
              " : " +
              inStates.decision.dateDecision
          );
        }

        console.log("USAGER HISTORIQUE - " + usager.historique.length);
        for (const inStates of usager.historique) {
          console.log(
            " ---> " + inStates.statut + " : " + inStates.dateDecision
          );
        }
        console.log(
          " ---> " +
            usager.decision.statut +
            " : " +
            usager.decision.dateDecision
        );

        // Recherche dans l'historique
      }
      throw new Error("ooppkpo");

      console.log(
        `${usagersHistory.length} = ${updated.length} + ${notUpdated.length}`
      );
    }
  }
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
