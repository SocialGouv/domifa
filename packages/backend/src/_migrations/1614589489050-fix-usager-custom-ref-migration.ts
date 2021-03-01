import { Model } from "mongoose";
import { MigrationInterface, QueryRunner } from "typeorm";
import { appHolder } from "../appHolder";
import { domifaConfig } from "../config";
import { appTypeormManager, UsagerTable } from "../database";
import { Usager } from "../usagers/interfaces/usagers";
import { appLogger } from "../util";

export class manualMigration1614589489050 implements MigrationInterface {
  name = "manualMigration1614589489050";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(
      `[Migration] UP "${this.name}" (env:${domifaConfig().envId})`
    );

    const usagerModel: Model<Usager> = appHolder.app.get("USAGER_MODEL");
    const totalUsagers: number = await usagerModel
      .count({
        $or: [
          { migratedFixUsagerRef: false },
          { migratedFixUsagerRef: { $exists: false } },
        ],
      })
      .exec();

    let currentCount = 0;
    do {
      currentCount += await this.migrateNextUsagers({
        queryRunner,
        currentCount,
        totalUsagers,
      });
    } while (currentCount < totalUsagers);

    appLogger.debug(
      `[Migration] [SUCCESS] "${this.name}" Usagers fixed applied`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const usagerModel: Model<Usager> = appHolder.app.get("USAGER_MODEL");
    await usagerModel.updateMany(
      { migratedFixUsagerRef: true },
      { $set: { migratedFixUsagerRef: false } },
      { multi: true }
    );
  }

  private async migrateNextUsagers({
    queryRunner,
    totalUsagers,
    currentCount,
  }: {
    queryRunner: QueryRunner;
    totalUsagers: number;
    currentCount: number;
  }): Promise<number> {
    appLogger.debug(`[Migration] migrateNextUsagers`);

    const usagerModel: Model<Usager> = appHolder.app.get("USAGER_MODEL");
    const mongoUsagers: Usager[] = await usagerModel
      .find({ migratedFixUsagerRef: { $ne: true } })
      .limit(1000)
      .exec();

    appLogger.debug(
      `[Migration] migrating ${mongoUsagers.length} usagers (${currentCount}/${totalUsagers})`
    );

    const usagerRepository = appTypeormManager.getRepository(
      UsagerTable,
      queryRunner.manager
    );

    if (mongoUsagers && mongoUsagers !== null && mongoUsagers.length) {
      for (const mongoUsager of mongoUsagers) {
        const customRef = mongoUsager.customId
          ? mongoUsager.customId
          : `${mongoUsager.id}`;

        await usagerRepository.update(
          {
            structureId: mongoUsager.structureId,
            ref: mongoUsager.id,
          },
          {
            customRef,
          }
        );

        await usagerModel.findOneAndUpdate(
          { _id: mongoUsager._id },
          { $set: { migratedFixUsagerRef: true } }
        );
      }
      return mongoUsagers.length;
    }
    return 0;
  }
}
