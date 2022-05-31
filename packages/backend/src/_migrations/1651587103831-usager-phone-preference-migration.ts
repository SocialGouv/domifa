import { MigrationInterface, QueryRunner } from "typeorm";

import { domifaConfig } from "../config";
import { usagerRepository } from "../database/services/usager/usagerRepository.service";
import { Usager } from "../_common/model";
import { appLogger } from "../util";

export class manualMigration1647933917641 implements MigrationInterface {
  name = "migrateUsagerPhonePreference1647933917641";

  public async up(): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      const usagers: Usager[] = await (
        await usagerRepository.typeorm()
      ).query(
        `
        SELECT uuid, preference
        FROM usager
        WHERE (preference->'phoneNumber')::text != 'null'
      `
      );
      appLogger.warn("[MIGRATION] SELECT ALL USAGER WITH PREFERENCE PHONE");

      for (const usager of usagers) {
        await usagerRepository.updateOne(
          {
            uuid: usager.uuid,
          },
          {
            preference: {
              phone: usager.preference.phone,
              phoneNumber: usager.preference.phoneNumber,
              telephone: {
                indicatif: "fr",
                numero: usager.preference.phoneNumber,
              },
            },
          }
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const usagers: Usager[] = await (
      await usagerRepository.typeorm()
    ).query(
      `
        SELECT uuid, preference
        FROM usager
        WHERE (preference->'phoneNumber')::text != 'null'
      `
    );

    for (const usager of usagers) {
      await usagerRepository.updateOne(
        {
          uuid: usager.uuid,
        },
        {
          preference: {
            phone: usager.preference.phone,
            phoneNumber: usager.preference.phoneNumber,
            telephone: {
              indicatif: "fr",
              numero: "",
            },
          },
        }
      );
    }
  }
}
