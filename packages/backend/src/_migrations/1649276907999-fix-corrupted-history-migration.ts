import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { usagerHistoryRepository, usagerRepository } from "../database";
import { appLogger } from "../util";
import { Usager, UsagerHistory, UsagerHistoryState } from "../_common/model";

export class manualMigration1649276907999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      const rawResults = await (
        await usagerHistoryRepository.typeorm()
      ).query(
        `select historique, decision, u.uuid, u."structureId", uh.states, uh."usagerUUID" FROM "usager_history" "uh" join usager u on uh."usagerUUID" = u.uuid where (u.decision->>'dateDecision')::date >= '2021-01-20' AND (u.decision->>'dateDecision')::date <= '2021-12-30'
        `
      );

      const usagersToCheck = [];
      for (const usager of rawResults) {
        let states: UsagerHistoryState[] = usager.states;
        states = states.filter(
          (state) => state.createdEvent === "new-decision"
        );

        if (states.length !== usager?.historique.length) {
          console.log();
          appLogger.debug(`${usager.uuid} Décalage `);
          console.log("States : " + states.length);
          console.log("Historique : " + usager?.historique.length);
          console.log(states);
          console.log(usager?.decision);
          console.log(usager?.historique);
          console.log();

          usagersToCheck.push(usager.uuid);
          throw new Error("opkpok");
        }
      }
      console.log(usagersToCheck.length + " usagers à mettre à jour");
    }

    throw new Error("opkpok");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
