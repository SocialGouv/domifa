import { MigrationInterface, QueryRunner, Repository } from "typeorm";

import { Model } from "mongoose";
import { appTypeormManager } from "../database/appTypeormManager.service";
import { InteractionDocument } from "../interactions/interactions.interface";
import { InteractionsTable } from "../interactions/pg/InteractionsTable.typeorm";

import { appHolder } from "../appHolder";
import { appLogger } from "../util";
import moment = require("moment");

export class autoMigration1605001375177 implements MigrationInterface {
  public name = "autoMigration1605001375177";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "interactions" (
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "version" integer NOT NULL,
        "_id" text,
        "dateInteraction" date NOT NULL DEFAULT 'now()',
        "nbCourrier" integer NOT NULL,
        "structureId" integer NOT NULL,
        "type" text NOT NULL,
        "usagerId" integer NOT NULL,
        "userId" integer NOT NULL,
        "userName" text NOT NULL,
        "content" text,
        CONSTRAINT "PK_006113a10247f411c459d62a5b3" PRIMARY KEY ("uuid") )`
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
      .limit(10)
      .exec();

    const totalInteractions: number = await interactionModel.count({}).exec();

    appLogger.debug(
      `[Migration] InteractionDocument ${mongoInteractions.length} Docs to migrate`
    );

    const interactionsRepository = appTypeormManager.getRepository(
      InteractionsTable,
      queryRunner.manager
    );

    const arrayInteractions = [];
    if (mongoInteractions && mongoInteractions !== null) {
      mongoInteractions.forEach((oldInteraction: InteractionDocument) => {
        arrayInteractions.push({
          _id: oldInteraction._id,
          type: oldInteraction.type,
          dateInteraction: oldInteraction.dateInteraction,
          content: oldInteraction.content || "",
          nbCourrier: oldInteraction.nbCourrier,
          usagerId: oldInteraction.usagerId,
          structureId: oldInteraction.structureId,
          userName: oldInteraction.userName,
          userId: oldInteraction.userId,
        });
      });
    }

    for (let index = 0; index < arrayInteractions.length; index++) {
      // Fin de la boucle, on vérifie qu'il n'en reste plus
      if (index === arrayInteractions.length - 1) {
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
            `[Migration] [ON HOLD] "${this.name}" InteractionsTable created : ${totalMigratedInteractions}/${totalInteractions} `
          );
          await this.getNextInteractions(queryRunner);
          // APPEL DU SUIVANT
        }
      } else {
        const retour = await interactionModel.findOneAndUpdate(
          { _id: arrayInteractions[index]._id },
          { $set: { migrated: true } }
        );

        appLogger.debug(
          `[Migration] [ON HOLD] "${arrayInteractions[index]._id}" migrated ${retour._id}`
        );

        await interactionsRepository.insert(arrayInteractions[index]);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "interactions"`);
  }
}
