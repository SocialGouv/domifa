import { interactionRepository } from "./../database/services/interaction/interactionRepository.service";
import { In, MigrationInterface, QueryRunner } from "typeorm";

import { Interactions, Usager } from "../_common/model";
import {
  interactionsCreator,
  interactionsTypeManager,
} from "../interactions/services";

export class manualMigration1667855065590 implements MigrationInterface {
  name = "updateCorruptedInteractionsMigration1667855065590";
  public async up(queryRunner: QueryRunner): Promise<void> {
    //
    // Etape 1 : on récupère tous les courriers / colis / recommandé réellement distribués pendant la période de bugs
    const interactions: Interactions[] = await queryRunner.query(
      `select * from interactions where "dateInteraction" >= '2022-11-16' and "type" in ('courrierOut', 'colisOut', 'recommandeOut') ORDER BY "dateInteraction" ASC`
    );

    for (let i = 0; i < interactions.length; i++) {
      console.log(
        i + " / " + interactions.length + " interactions à mettre à jour"
      );
      const interactionToUpdate: Interactions = interactions[i];

      const oppositeType = interactionsTypeManager.getOppositeDirectionalType({
        type: interactionToUpdate.type,
        direction: "out",
      });

      console.log("");

      console.log(
        interactionToUpdate.nbCourrier +
          " " +
          interactionToUpdate.type +
          " distribués le : " +
          interactionToUpdate.dateInteraction +
          " - " +
          interactionToUpdate.usagerUUID
      );
      // On récupère les id des courriers entrants à mettre à jour
      const uuidsToUpdate: {
        uuid: string;
        interactionOutUUID: string;
        dateInteraction: Date;
        nbCourrier: number;
      }[] = await queryRunner.query(
        `SELECT uuid, "interactionOutUUID", "dateInteraction", "nbCourrier" from "interactions" where event='create' and "usagerUUID"=$1 AND "dateInteraction" < $2 and type = $3 and ("interactionOutUUID" is null or "interactionOutUUID" = $4) `,
        [
          interactionToUpdate.usagerUUID,
          interactionToUpdate.dateInteraction,
          oppositeType,
          interactionToUpdate.uuid,
        ]
      );

      const total = uuidsToUpdate.reduce(
        (sum: number, current) => sum + current.nbCourrier,
        0
      );
      // console.log(uuidsToUpdate);
      // console.log(
      // total +
      // " " +
      // interactionToUpdate.type +
      // " rectifiés le : " +
      // interactionToUpdate.dateInteraction +
      // " - " +
      // interactionToUpdate.usagerUUID
      // );
      const uuids: string[] = [];

      uuidsToUpdate.map(
        (current: {
          uuid: string;
          interactionOutUUID: string;
          dateInteraction: Date;
          nbCourrier: number;
        }) => uuids.push(current.uuid)
      );

      // Mise à jour du nombre de courrier de la distribution
      await interactionRepository
        .createQueryBuilder("structures")
        .update()
        .set({
          nbCourrier: total,
        })
        .where({
          uuid: interactionToUpdate.uuid,
        })
        .execute();

      // Mise à jour des courriers reçus, avec les bons uuid de distribution
      await interactionRepository
        .createQueryBuilder("structures")
        .update()
        .set({
          interactionOutUUID: interactionToUpdate.uuid,
        })
        .where({
          event: "create",
          usagerUUID: interactionToUpdate.usagerUUID,
          uuid: In(uuids),
        })
        .execute();
    }

    // Recompte des courriers en attente de tous les usagers
    const usagersToUpdate: Usager[] = await queryRunner.query(
      `select * from usager where "updatedAt" > '2022-11-15'`
    );

    let i = 0;
    for (const usager of usagersToUpdate) {
      await interactionsCreator.updateUsagerAfterCreation({
        usager,
      });
      i++;
      console.log(
        i + " / " + usagersToUpdate.length + " usagers à mettre à jour"
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
