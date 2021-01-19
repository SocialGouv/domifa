import { Model } from "mongoose";
import { MigrationInterface, QueryRunner } from "typeorm";
import { appHolder } from "../appHolder";
import { appTypeormManager, InteractionsTable } from "../database";
import { InteractionDocument } from "../interactions/interactions.interface";
import { appLogger } from "../util";

export class autoMigration1606839814472 implements MigrationInterface {
  public name = "autoMigration1606839814472";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.getNextInteractions(queryRunner);
  }

  private async getNextInteractions(queryRunner: QueryRunner) {
    appLogger.debug(`[Migration] getNextInteractions`);

    const interactionModel: Model<InteractionDocument> = appHolder.app.get(
      "INTERACTION_MODEL"
    );
    const mongoInteractions: InteractionDocument[] = await interactionModel
      .find({ migrated: { $exists: false } })
      .limit(1000)
      .exec();

    const totalInteractions: number = await interactionModel.count({}).exec();

    appLogger.debug(
      `[Migration] InteractionDocument ${mongoInteractions.length} Docs to migrate`
    );

    const interactionsRepository = appTypeormManager.getRepository(
      InteractionsTable,
      queryRunner.manager
    );

    if (mongoInteractions && mongoInteractions !== null) {
      for (let index = 0; index < mongoInteractions.length; index++) {
        // Fin de la boucle, on vérifie qu'il n'en reste plus
        const oldInteraction: InteractionDocument = mongoInteractions[index];

        if (oldInteraction.nbCourrier === 0) {
          oldInteraction.nbCourrier = 1;
        }

        const interactionToMigrate = {
          _id: oldInteraction._id,
          type: oldInteraction.type,
          dateInteraction: new Date(
            oldInteraction.dateInteraction
          ).toISOString(),
          content: oldInteraction.content || "",
          nbCourrier: oldInteraction.nbCourrier,
          usagerId: oldInteraction.usagerId,
          structureId: oldInteraction.structureId,
          userName: oldInteraction.userName,
          userId: oldInteraction.userId,
        };

        await interactionModel.findOneAndUpdate(
          { _id: interactionToMigrate._id },
          { $set: { migrated: true } }
        );

        await interactionsRepository.insert(interactionToMigrate);

        if (index === mongoInteractions.length - 1) {
          // Total migré
          const totalMigratedInteractions: number = await interactionModel
            .count({ migrated: true })
            .exec();

          if (totalMigratedInteractions === totalInteractions) {
            appLogger.debug(
              `[Migration] [SUCCESS] "${this.name}" InteractionsTable migrated totally`
            );
          } else {
            appLogger.debug(
              `[Migration] [ON HOLD] "${this.name}" Migration continue : ${totalMigratedInteractions}/${totalInteractions} `
            );

            await this.getNextInteractions(queryRunner);
          }
        }
      }
    } else {
      appLogger.debug(
        `[Migration] [SUCCESS FINISH] End migration interactions`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
