/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { usagerLightRepository } from "../database/services/usager/usagerLightRepository.service";
import { MigrationInterface, QueryRunner } from "typeorm";
import { interactionRepository } from "../database";
import { appLogger } from "../util";

export class fixCorreuptedUsagersMigration1641309834050
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn(
      "[MIRATION] Correction des fiches aux mauvais nombres d'interactions"
    );

    const usagers = await usagerLightRepository.findManyWithQuery({
      select: ["uuid", "ref", "lastInteraction", "structureId"],
      where: `("lastInteraction"->>'courrierIn')::integer < 0 OR ("lastInteraction"->>'recommandeIn' )::integer< 0 OR ("lastInteraction"->>'colisIn' )::integer< 0  `,
      order: {
        uuid: "ASC",
      },
    });

    appLogger.warn(
      "[MIRATION] " + usagers.length + " dossiers à mettre à jour"
    );

    for (const usager of usagers) {
      const lastInteractionCount =
        await interactionRepository.countPendingInteractionsIn({
          structureId: usager.structureId,
          usagerRef: usager.ref,
        });

      usager.lastInteraction.courrierIn = lastInteractionCount.courrierIn;
      usager.lastInteraction.colisIn = lastInteractionCount.colisIn;
      usager.lastInteraction.recommandeIn = lastInteractionCount.recommandeIn;

      usager.lastInteraction.enAttente =
        usager.lastInteraction.courrierIn > 0 ||
        usager.lastInteraction.colisIn > 0 ||
        usager.lastInteraction.recommandeIn > 0;

      await usagerLightRepository.updateOne(
        { uuid: usager.uuid },
        { lastInteraction: usager.lastInteraction }
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
