import * as moment from "moment";
import { Model } from "mongoose";
import { MigrationInterface, QueryRunner } from "typeorm";
import { appHolder } from "../appHolder";
import { appTypeormManager } from "../database/appTypeormManager.service";
import { StructureStatsTable } from "../stats/pg/StructureStatsTable.typeorm";
import { StatsDocument } from "../stats/stats.interface";
import { DepartementHelper } from "../structures/departement-helper.service";
import { appLogger } from "../util";

export class autoMigration1603812391580 implements MigrationInterface {
  name = "autoMigration1603812391580";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP "${this.name}"`);

    await queryRunner.query(`CREATE TABLE "structure_stats" 
      ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "_id" text, "nom" text NOT NULL, "date" date NOT NULL, "structureId" integer NOT NULL, "structureType" text NOT NULL, "departement" text NOT NULL, "ville" text NOT NULL, "capacite" integer, "codePostal" text NOT NULL, "questions" jsonb NOT NULL, 
       CONSTRAINT "UQ_102c69c2491695e723e3b7ed4ec" UNIQUE ("date", "structureId"),
       CONSTRAINT "PK_ed21deae6f1374998af1cb267b9" PRIMARY KEY ("uuid"))
       `);
    const statsModel: Model<StatsDocument> = appHolder.app.get("STATS_MODEL");

    const mongoStats = await statsModel
      .find({})
      // .sort({ createdAt: 1 })
      .lean()
      .exec();

    appLogger.debug(
      `[Migration] "${this.name}" ${mongoStats.length} StatsDocument to migrate`
    );

    const departementHelper = appHolder.app.get<DepartementHelper>(
      DepartementHelper
    );
    const itemsToCreateCache = mongoStats.reduce(
      (acc, stat) => {
        const pgStat = new StructureStatsTable({
          _id: stat._id.toString(),
          createdAt: stat.createdAt,
          date: moment(stat.createdAt).subtract(1, "day").toDate(),
          nom: stat.nom,
          structureId: stat.structureId,
          structureType: stat.structureType,
          departement: departementHelper.getDepartementFromCodePostal(
            stat.codePostal
          ),
          ville: stat.ville,
          capacite: stat.capacite,
          codePostal: stat.codePostal,
          questions: stat.questions,
        });

        const uniqueKey = `${pgStat.structureId}_${pgStat.date.getFullYear()}-${pgStat.date.getMonth() + 1
          }-${pgStat.date.getDate()}`;
        // we keep last value in case of duplicated stats
        if (
          !acc[uniqueKey] ||
          acc[uniqueKey].createdAt.getTime() < pgStat.createdAt.getTime()
        ) {
          // in case of duplicated, keep only last value
          acc[uniqueKey] = pgStat;
        }
        return acc;
      },
      {} as {
        [key: string]: StructureStatsTable;
      }
    );

    const createdCount = Object.keys(itemsToCreateCache).length;
    const structureStatsRepository = appTypeormManager.getRepository(
      StructureStatsTable,
      queryRunner.manager
    );

    for (const pgStat of Object.values(itemsToCreateCache)) {
      await structureStatsRepository.insert(pgStat);
    }

    appLogger.debug(
      `[Migration] [SUCCESS] "${this.name
      }" ${createdCount} StructureStatsTable created (${mongoStats.length - createdCount
      } ignored)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "structure_stats"`);
  }
}
