import { domifaConfig } from "./../config/domifaConfig.service";
import { MigrationInterface, QueryRunner } from "typeorm";

import { Structure, Usager } from "../_common/model";

import { interactionRepository } from "../database";
import { differenceInCalendarDays } from "date-fns";

export class manualMigration1667855065599 implements MigrationInterface {
  name = "updateLastInteractionMigration1667855065599";
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "prod") {
      await queryRunner.query(
        `UPDATE usager SET "migrated" = false WHERE "structureId"=966`
      );

      // Recompte des courriers en attente de tous les usagers
      const usagersToUpdate: Pick<
        Usager,
        "uuid" | "updatedAt" | "lastInteraction"
      >[] = await queryRunner.query(
        `select uuid, ref, "lastInteraction"::jsonb, "structureId" from usager where "structureId" = 966 ORDER BY ref ASC`
      );

      const structures: Structure[] = await queryRunner.query(
        `select * from structure WHERE id=966 `
      );

      for (let i = 0; i < usagersToUpdate.length; i++) {
        const usager = usagersToUpdate[i];

        const lastInteraction = usager.lastInteraction;

        const lastInteractionCount =
          await interactionRepository.countPendingInteractionsIn({
            usagerUUID: usager.uuid,
            structure: structures[0],
          });

        const lastDateFromInteractions: Date | null =
          lastInteractionCount.lastInteractionOut;

        if (lastDateFromInteractions) {
          if (!lastInteraction.dateInteraction) {
            lastInteraction.dateInteraction = lastDateFromInteractions;
          } else {
            const lastDate = usager.lastInteraction.dateInteraction;

            if (
              differenceInCalendarDays(lastDateFromInteractions, lastDate) > 0
            ) {
              lastInteraction.dateInteraction = lastDateFromInteractions;
            }
          }
        }

        lastInteraction.courrierIn = lastInteractionCount.courrierIn;
        lastInteraction.colisIn = lastInteractionCount.colisIn;
        lastInteraction.recommandeIn = lastInteractionCount.recommandeIn;

        lastInteraction.enAttente =
          lastInteraction.courrierIn > 0 ||
          lastInteraction.colisIn > 0 ||
          lastInteraction.recommandeIn > 0;

        await queryRunner.query(
          `UPDATE usager set migrated=true, "lastInteraction"=$1, "updatedAt"=$2 where uuid =$3`,
          [lastInteraction, new Date(), usager.uuid]
        );

        if (i % 100 === 0) {
          console.log(
            i + " / " + usagersToUpdate.length + " usagers à mettre à jour"
          );
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
