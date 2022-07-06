import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { usagerRepository } from "../database";

import { Usager } from "../_common/model";

export class migratePhoneNumberUsagerMigration1657059112532
  implements MigrationInterface
{
  name = "migratePhoneNumberUsagerMigration1657059112532";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      console.warn(
        "\n[MIGRATION] Migrer vers le nouveau format de téléphone - Start \n"
      );
      const usagers: Usager[] = await (
        await usagerRepository.typeorm()
      ).query(
        `
        SELECT uuid, preference
        FROM usager
        WHERE (preference->'phoneNumber')::text != 'null' AND (preference->'phoneNumber')::text != ''
      `
      );

      console.log(usagers.length + " usagers concernés par la migration");

      for (const usager of usagers) {
        await usagerRepository.updateOne(
          {
            uuid: usager.uuid,
          },
          {
            preference: {
              contactByPhone: true,
              telephone: {
                countryCode: "fr",
                numero: usager.preference.phoneNumber
                  .toString()
                  .replace(/\s/g, "+"),
              },
            },
          }
        );
      }
    }

    console.warn(
      "\n[MIGRATION] Migrer vers le nouveau format de téléphone - END \n"
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
