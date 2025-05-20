import { MigrationInterface, Point, QueryRunner } from "typeorm";
import { structureRepository } from "../database";
import axios from "axios";
import { FrenchAddress } from "../modules/structures/services/location.service";
import { appLogger } from "../util";
import { FeatureCollection } from "geojson";
import { domifaConfig } from "../config";
import axiosRetry from "axios-retry";

export class ManualMigration1746974453999 implements MigrationInterface {
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

      const axiosInstance = axios.create({ timeout: 4000 });

      axiosRetry(axiosInstance, {
        retries: 3,
        retryDelay: axiosRetry.exponentialDelay,
        retryCondition: (error) => {
          return (
            axiosRetry.isNetworkOrIdempotentRequestError(error) ||
            (error.response && error.response.status >= 500)
          );
        },
      });

      for (let i = 0; i < structures.length; i++) {
        const structure = structures[i];
        const city = structure.ville.toLowerCase().replace("cedex", " ").trim();
        const apiUrl = "https://data.geopf.fr/geocodage/search";
        const params = {
          q: city,
          limit: 1,
          lat: structure.latitude,
          lon: structure.longitude,
          type: "municipality",
          index: "address",
        };

        try {
          const response = await axiosInstance.get<
            FeatureCollection<Point, FrenchAddress>
          >(apiUrl, { params });

          if (!response.data.features.length) {
            console.log(params);

            appLogger.warn(
              `[GET LOCATION] Cannot get location from this city ${city}`
            );
          } else {
            const citycode = response.data.features[0].properties.citycode;
            console.log(
              `${structure.nom} - ${city} - ${structure.codePostal} = ${citycode}`
            );
            await structureRepository.update(
              { uuid: structure.uuid },
              { cityCode: citycode }
            );
          }
        } catch (error) {
          console.log(params);
          appLogger.error(
            `[GET LOCATION] Failed after retries for ${city}: ${error.message}`
          );
        }

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
