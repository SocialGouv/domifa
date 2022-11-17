import { MigrationInterface, QueryRunner } from "typeorm";

import { Interactions } from "../_common/model";
import { interactionsTypeManager } from "../interactions/services";

export class manualMigration1667855065593 implements MigrationInterface {
  name = "updateCorruptedInteractionsMigration1667855065593";
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Etape 1 : on récupère tous les courriers / colis / recommandé réellement distribués pendant la période de bugs
    const interactionsOutToUpdate: Interactions[] = await queryRunner.query(
      `select "type", "usagerUUID", "dateInteraction", "uuid" from interactions where "event"='create' and "dateInteraction" >= '2022-11-16' and "type" in ('courrierOut', 'colisOut', 'recommandeOut') ORDER BY "dateInteraction" ASC`
    );

    for (let i = 0; i < interactionsOutToUpdate.length; i++) {
      if (i % 100 === 0) {
        console.log(
          i +
            " / " +
            interactionsOutToUpdate.length +
            " interactions à mettre à jour"
        );
      }

      const interactionOutToUpdate: Interactions = interactionsOutToUpdate[i];

      const oppositeType = interactionsTypeManager.getOppositeDirectionalType({
        type: interactionOutToUpdate.type,
        direction: "out",
      });

      // On récupère les id des courriers entrants à mettre à jour
      const interactionsOfTypeInToUpdate: {
        uuid: string;
        nbCourrier: number;
      }[] = await queryRunner.query(
        `SELECT uuid, "nbCourrier" from "interactions" where event='create' and "usagerUUID"=$1 AND "dateInteraction" < $2 and type = $3 and ("interactionOutUUID" is null or "interactionOutUUID" = $4) `,
        [
          interactionOutToUpdate.usagerUUID,
          interactionOutToUpdate.dateInteraction,
          oppositeType,
          interactionOutToUpdate.uuid,
        ]
      );

      let total = 0;

      interactionsOfTypeInToUpdate.forEach(
        (current: { uuid: string; nbCourrier: number }) => {
          total += current.nbCourrier;
        }
      );

      await queryRunner.query(
        `update interactions set "nbCourrier" = $1 where uuid = $2`,
        [total, interactionOutToUpdate.uuid]
      );

      await queryRunner.query(
        `update interactions set "interactionOutUUID" = $1 where event='create' and "usagerUUID"=$2 AND "dateInteraction" < $3 and type = $4 and ("interactionOutUUID" is null or "interactionOutUUID" = $5)`,
        [
          interactionOutToUpdate.uuid,
          interactionOutToUpdate.usagerUUID,
          interactionOutToUpdate.dateInteraction,
          oppositeType,
          interactionOutToUpdate.uuid,
        ]
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
