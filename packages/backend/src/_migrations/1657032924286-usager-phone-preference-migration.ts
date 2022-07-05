import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { usagerRepository } from "../database";
import { appLogger } from "../util";
import { Usager } from "../_common/model";

export class migratePhoneNumberUsagerMigration1657032924286
  implements MigrationInterface
{
  name = "migratePhoneNumberUsagerMigration1657032924286";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      appLogger.warn("[MIGRATION] SELECT ALL USAGER WITH PREFERENCE PHONE");
      const usagers: Usager[] = await (
        await usagerRepository.typeorm()
      ).query(
        `
        SELECT uuid, preference
        FROM usager
        WHERE (preference->'phoneNumber')::text != 'null' AND (preference->'phoneNumber')::text != '' AND (preference->'phoneNumber')::text != null
      `
      );

      appLogger.warn(
        "[MIGRATION] [PHONES] " + usagers.length + " avec numéro de téléphone"
      );

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
                numero: usager.preference.phoneNumber,
              },
            },
          }
        );
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
