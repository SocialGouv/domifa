import moment = require("moment");
import { Model } from "mongoose";
import { MigrationInterface, QueryRunner } from "typeorm";
import { appHolder } from "../appHolder";
import { appTypeormManager, StructureStatsTable } from "../database";
import { setFixStatsDateTime } from "../stats/services/stats-generator.service";
import { Structure } from "../structures/structure-interface";
import { appLogger } from "../util";

export class manualMigration1613425788374 implements MigrationInterface {
  name = "manualMigration1613425788374";
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP "${this.name}"`);

    const typeormRepository = await appTypeormManager.getRepository(
      StructureStatsTable
    );
    let qb = typeormRepository
      .createQueryBuilder()
      .select([`"structureId"`, "max(date)"])
      .orderBy(`"structureId"`)
      .groupBy(`"structureId"`);

    const results = await qb.getRawMany();

    for (let result of results) {
      const maxDate = moment(result["max"]).toDate();
      const lastExport = setFixStatsDateTime(maxDate);

      const structureModel: Model<Structure> = appHolder.app.get(
        "STRUCTURE_MODEL"
      );

      await structureModel
        .updateOne({ id: result["structureId"] }, { $set: { lastExport } })
        .exec();
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
