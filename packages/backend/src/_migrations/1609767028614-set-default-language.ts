import { Model } from "mongoose";
import { MigrationInterface, QueryRunner } from "typeorm";
import { appHolder } from "../appHolder";
import { Usager } from "../usagers/interfaces/usagers";
import { appLogger } from "../util";

export class manualMigration1609767028614 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const interactionModel: Model<Usager> = appHolder.app.get("USAGER_MODEL");

    await interactionModel
      .updateMany({ langue: { $exists: false } }, { $set: { langue: "" } })
      .exec();

    appLogger.debug(`[Migration] [SUCCESS FINISH] End update Languages`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
