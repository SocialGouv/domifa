import { MigrationInterface } from "typeorm";

import { domifaConfig } from "../config";
import { usagerRepository } from "../database/services/usager/usagerRepository.service";
import { Usager } from "../_common/model";
import { appLogger } from "../util";

export class manualMigration1647927362093 implements MigrationInterface {
  name = "migrateUsagerPhone1647927362093";

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
        SELECT uuid, phone
        FROM usager
        WHERE phone != ''
      `
      );
      appLogger.warn("[MIGRATION] SELECT ALL USAGER WITH PHONE");

      for (const usager of usagers) {
        await usagerRepository.updateOne(
          {
            uuid: usager.uuid,
          },
          {
            telephone: { indicatif: "fr", numero: usager.phone },
          }
        );
      }
    }
  }

  public async down(): Promise<void> {
    appLogger.warn("[MIGRATION] DOWN");
    const usagers: Usager[] = await (
      await usagerRepository.typeorm()
    ).query(
      `
        SELECT uuid, phone
        FROM usager
        WHERE phone != ''
      `
    );
    appLogger.warn("[MIGRATION] SELECT ALL USAGER WITH PHONE");

    for (const usager of usagers) {
      await usagerRepository.updateOne(
        {
          uuid: usager.uuid,
        },
        {
          telephone: { indicatif: "fr", numero: "" },
        }
      );
    }
  }
}
