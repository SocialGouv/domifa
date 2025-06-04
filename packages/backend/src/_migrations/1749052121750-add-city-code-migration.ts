/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { openDataPlaceRepository, structureRepository } from "../database";

import { getCityCode } from "../modules/structures/services/location.service";
import { appLogger } from "../util";
import { openDataCitiesRepository } from "../database/services/open-data/open-data-cities-repository";

export class AddCityCodeMigration1749052121750 implements MigrationInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(_queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      const structures = await structureRepository.find({
        where: {},
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

      const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      for (let i = 0; i < structures.length; i++) {
        const structure = structures[i];
        const cityCode = await getCityCode(structure);

        if (!cityCode) {
          return;
        }
        const cityData = await openDataCitiesRepository.findOneBy({
          cityCode,
        });

        if (!cityData) {
          return;
        }
        await structureRepository.update(
          { uuid: structure.uuid },
          { cityCode, populationSegment: cityData.populationSegment }
        );

        await openDataPlaceRepository.update(
          { codePostal: structure.codePostal },
          { cityCode, populationSegment: cityData.populationSegment }
        );

        if ((i + 1) % 300 === 0 && i < structures.length - 1) {
          appLogger.info(
            `[GET LOCATION] Pausing for 3 seconds after ${i + 1} structures`
          );
          await sleep(1500);
        }
      }

      appLogger.info(
        `[GET LOCATION] Process completed for ${structures.length} structures`
      );
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
