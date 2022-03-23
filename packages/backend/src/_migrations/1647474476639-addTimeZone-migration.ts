import { TimeZone } from "../util/territoires/types/TimeZone.type";

import { MigrationInterface, QueryRunner } from "typeorm";
import { structureRepository } from "../database";
import { appLogger } from "../util";
import { domifaConfig } from "../config";
import { REGIONS_DEF, RegionDef } from "../util/territoires";

export class addTimeZoneMigration1647474476639 implements MigrationInterface {
  name = "addTimeZoneMigration1647474476639";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(_queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      appLogger.warn("[MIGRATION] Récupération des structures");

      // Liste des départements : 93 => Seine-Saint-Denis
      const REGIONS_TIMEZONES: { [key: string]: TimeZone } = REGIONS_DEF.reduce(
        (acc, region: RegionDef) => {
          acc[region.regionCode.toString()] = region.timeZone;

          return acc;
        },
        {} as { [key: string]: TimeZone }
      );

      const structures = await structureRepository.count({
        where: {
          timeZone: null,
        },
      });

      appLogger.warn(
        "[MIGRATION] " + structures + " structures à mettre à jour"
      );

      for (const region of Object.keys(REGIONS_TIMEZONES)) {
        await (
          await structureRepository.typeorm()
        )
          .createQueryBuilder("structure")
          .update()
          .set({ timeZone: REGIONS_TIMEZONES[region] })
          .where({
            timeZone: null,
            region,
          })
          .execute();
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "timeZone"`);
  }
}
