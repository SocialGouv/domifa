import { MigrationInterface, QueryRunner } from "typeorm";
import { openDataCitiesRepository } from "../database/services/open-data/open-data-cities-repository";
import { join } from "path";
import {
  DEPARTEMENTS_LISTE,
  getRegionCodeFromDepartement,
  REGIONS_LISTE,
} from "@domifa/common";
import { parse } from "csv-parse";
import { readFile } from "fs/promises";
import { isNil } from "lodash";
import { OpenDataCity } from "../modules/open-data/interfaces";
import { domifaConfig } from "../config";

export class ManualMigration1746958058086 implements MigrationInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(_queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await openDataCitiesRepository.delete({});

      const file = join(__dirname, "../_static/cities-with-population.csv");

      const content = await readFile(file, "utf8");
      const data = new Map<string, any>();

      const records = parse(content, {
        skip_empty_lines: true,
        delimiter: ";",
        fromLine: 2,
        trim: true,
        rtrim: true,
        columns: ["codgeo", "libgeo", "an", "p_pop"],
      });

      for await (const record of records) {
        const codeGeo = record.codgeo.toString();
        const annee = parseInt(record.an);

        if (!data.has(codeGeo) || parseInt(data.get(codeGeo).an) < annee) {
          data.set(codeGeo, record);
        }
      }

      const localites = Array.from(data.values())
        .filter((row) => !isNil(row?.codgeo) && row?.codgeo !== "")
        .map((row) => {
          const departementCode = row.codgeo.startsWith("97")
            ? row.codgeo.substring(0, 3)
            : row.codgeo.substring(0, 2);

          const regionCode = departementCode
            ? getRegionCodeFromDepartement(departementCode)
            : "00";

          const data: OpenDataCity = {
            cityCode: row.codgeo.toString(),
            city: row.libgeo.toString(),
            population: row.p_pop ? parseInt(row.p_pop) : 0,
            departmentCode: departementCode,
            department: DEPARTEMENTS_LISTE[departementCode],
            regionCode,
            region: REGIONS_LISTE[regionCode],
            areas: null,
            postalCode: null,
          };
          return data;
        });

      const batchSize = 1000;
      let batch = [];

      for (let i = 0; i < localites.length; i++) {
        if (
          localites[i]?.cityCode &&
          localites[i]?.city &&
          localites[i]?.departmentCode &&
          localites[i]?.departmentCode !== ""
        ) {
          batch.push(localites[i]);
        } else {
          console.log(localites[i]);
        }

        if (batch.length === batchSize || i === localites.length - 1) {
          await openDataCitiesRepository.save(batch);

          console.log(
            `Lot inséré: ${i - batch.length + 2} à ${i + 1} sur ${
              localites.length
            }`
          );

          batch = [];
        }
      }
      console.log(
        `Traitement terminé: ${localites.length} localités insérées.`
      );
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
