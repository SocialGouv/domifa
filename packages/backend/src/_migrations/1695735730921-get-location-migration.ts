import { MigrationInterface, QueryRunner } from "typeorm";
import { structureRepository } from "../database";
import { getLocation } from "../structures/services/location.service";
import { domifaConfig } from "../config";

export class GetLocationMigration1695735730921 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log(
      "\n\n\n[MIGRATION] Ajout des localisations à partir des adresses...\n\n\n"
    );

    if (
      (domifaConfig().envId === "preprod" ||
        domifaConfig().envId === "local" ||
        domifaConfig().envId === "prod") &&
      domifaConfig().cron.enable
    ) {
      const structuresCount = await queryRunner.query(
        "SELECT COUNT(uuid) FROM structure where latitude is null"
      );
      console.log(" ");
      console.log(" ");
      console.log(structuresCount[0].count + " structures");
      console.log(" ");
      console.log(" ");

      const structures = await queryRunner.query(
        `SELECT "uuid", "adresse", "codePostal", "nom", "ville" FROM structure where latitude is null order by "lastLogin" DESC`
      );

      for (const structure of structures) {
        let address = structure.adresse;
        let position: any = await getLocation(address, structure.codePostal);

        if (!position) {
          address = structure.adresse + ", " + structure.ville;
          position = await getLocation(address);
        }

        if (position) {
          const longitude = position.coordinates[0];
          const latitude = position.coordinates[1];

          await structureRepository.update(
            { uuid: structure.uuid },
            {
              longitude,
              latitude,
            }
          );
        } else {
          console.log({
            nom: structure.nom,
            address,
            codePostal: structure.codePostal,
          });
        }
      }
    } else {
      console.log("[MIGRATION SKIPPED] Get location disabled in this env");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
