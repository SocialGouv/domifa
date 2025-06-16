/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsNull, MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { openDataPlaceRepository } from "../database";

import { getCityCode } from "../modules/structures/services/location.service";
import { appLogger } from "../util";
import { openDataCitiesRepository } from "../database/services/open-data/open-data-cities-repository";

export class AddCityCodeMigration1749052121753 implements MigrationInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(_queryRunner: QueryRunner): Promise<void> {
    appLogger.info("[MIGRATION] Add cityCode to open data places");
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      const structures = await openDataPlaceRepository.find({
        where: { cityCode: IsNull() },
        select: {
          uuid: true,
          nom: true,
          codePostal: true,
          ville: true,
          departement: true,
          latitude: true,
          longitude: true,
        },
      });

      for (let i = 0; i < structures.length; i++) {
        const structure = structures[i];
        const cityCode = structure?.cityCode ?? (await getCityCode(structure));

        if (!cityCode) {
          appLogger.warn("CityCode Not found by address " + structure.ville);
          continue;
        }

        const cityData = await openDataCitiesRepository.findOneBy({
          cityCode,
        });

        if (!cityData) {
          appLogger.warn(
            "CityCode Not found in open data cities " + structure.ville
          );

          continue;
        }

        await openDataPlaceRepository.update(
          { uuid: structure.uuid },
          { cityCode, populationSegment: cityData.populationSegment }
        );
      }

      appLogger.info(
        `[GET LOCATION] Process completed for ${structures.length} structures`
      );
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
