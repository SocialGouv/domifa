import { Model } from "mongoose";
import { MigrationInterface, QueryRunner } from "typeorm";
import { appHolder } from "../appHolder";
import { appTypeormManager, InteractionsTable } from "../database";
import { InteractionDocument } from "../interactions/interactions.interface";
import { appLogger } from "../util";

export class autoMigration1605001375177 implements MigrationInterface {
  public name = "autoMigration1605001375177";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const interactionModel: Model<InteractionDocument> = appHolder.app.get(
      "INTERACTION_MODEL"
    );

    await interactionModel
      .updateMany({}, { $unset: { migrated: null } })
      .exec();

    await queryRunner.query(
      `CREATE TABLE "interactions"
      ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
             "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "version" integer NOT NULL,
            "id" SERIAL NOT NULL,
            "_id" text,
            "dateInteraction" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "nbCourrier" integer NOT NULL,
            "structureId" integer NOT NULL,
            "type" text NOT NULL,
            "usagerId" integer NOT NULL,
            "userId" integer NOT NULL,
            "userName" text NOT NULL,
            "content" text, CONSTRAINT
            "PK_9cf825bde3ff3a979664feb460f" PRIMARY KEY ("uuid", "id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1953f5ad67157bada8774f7e24" ON "interactions" ("structureId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c7086be1b4ebe5db4b6db30cb6" ON "interactions" ("usagerId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9992157cbe54583ff7002ae4c0" ON "interactions" ("userId") `
    );

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
        if (index === mongoInteractions.length) {
          //
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
            // APPEL DU SUIVANT
          }
        } else {
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

          const retour = await interactionModel.findOneAndUpdate(
            { _id: interactionToMigrate._id },
            { $set: { migrated: true } }
          );

          // appLogger.debug(
          //   `[Migration] [DEBUG] "${interactionToMigrate.dateInteraction}" migrated ${retour._id}`
          // );

          await interactionsRepository.insert(interactionToMigrate);
        }
      }
    } else {
      appLogger.debug(
        `[Migration] [SUCCESS FINISH] End migration interactions`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_9992157cbe54583ff7002ae4c0"`);
    await queryRunner.query(`DROP INDEX "IDX_c7086be1b4ebe5db4b6db30cb6"`);
    await queryRunner.query(`DROP INDEX "IDX_1953f5ad67157bada8774f7e24"`);
    await queryRunner.query(`DROP TABLE "interactions"`);
  }
}
