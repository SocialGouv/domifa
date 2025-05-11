import { MigrationInterface, Point, QueryRunner } from "typeorm";
import { structureRepository } from "../database";
import axios from "axios";
import { FrenchAddress } from "../modules/structures/services/location.service";
import { appLogger } from "../util";
import { FeatureCollection } from "geojson";
import { domifaConfig } from "../config";

export class ManualMigration1746974453388 implements MigrationInterface {
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
          codePostal: true,
          ville: true,
          departement: true,
        },
      });

      for (const structure of structures) {
        console.log(structure.ville);
        const apiUrl = "https://data.geopf.fr/geocodage/search";

        const params = {
          q: structure.ville,
          limit: 1,
          postcode: structure.codePostal,
          type: "municipality",
          index: "address",
        };

        const response = await axios.get<
          FeatureCollection<Point, FrenchAddress>
        >(apiUrl, {
          params,
          timeout: 4000,
        });

        if (!response.data.features.length) {
          appLogger.warn(
            `[GET LOCATION] Cannot get location from this city ${structure.ville}`
          );
          return null;
        }

        const citycode = response.data.features[0].properties.citycode;

        await structureRepository.update(
          { uuid: structure.uuid },
          { cityCode: citycode }
        );
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
