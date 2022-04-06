import { MigrationInterface, QueryRunner } from "typeorm";

import { domifaConfig } from "../config";
import { structureRepository } from "../database/services/structure/structureRepository.service";
import { Structure } from "../_common/model";
import { appLogger } from "../util";

export class manualMigration1649063145128 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // if (
    //   domifaConfig().envId === "prod" ||
    //   domifaConfig().envId === "preprod" ||
    //   domifaConfig().envId === "local"
    // ) {
    //   const structures: Structure[] = await (
    //     await structureRepository.typeorm()
    //   ).query(
    //     `
    //     SELECT uuid, phone
    //     FROM structure
    //     WHERE phone != ''
    //   `
    //   );
    //   appLogger.warn("[MIGRATION] SELECT ALL STRUCTURE WITH PHONE");
    //   for (const structure of structures) {
    //     await structureRepository.updateOne(
    //       {
    //         uuid: structure.uuid,
    //       },
    //       {
    //         telephone: { indicatif: "+33", numero: structure.phone },
    //       }
    //     );
    //   }
    // }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const structures: Structure[] = await (
      await structureRepository.typeorm()
    ).query(
      `
        SELECT uuid, phone
        FROM structure
        WHERE phone != ''
      `
    );
    appLogger.warn("[MIGRATION] DOWN SELECT ALL STRUCTURE WITH PHONE");

    for (const structure of structures) {
      await structureRepository.updateOne(
        {
          uuid: structure.uuid,
        },
        {
          telephone: { indicatif: "+33", numero: "" },
        }
      );
    }
  }
}
