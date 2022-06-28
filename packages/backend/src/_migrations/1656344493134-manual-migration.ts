import { MigrationInterface, QueryRunner } from "typeorm";
import { usagerRepository } from "../database";
import { appLogger } from "../util";

export class manualMigration1656344493134 implements MigrationInterface {
  name = "manualMigration1656344493134";
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn("[MIGRATION] - Remise à zéro de la variable de migration");

    await (
      await usagerRepository.typeorm()
    ).query(`update "usager" set migrated = true where migrated = false`);

    await (
      await usagerRepository.typeorm()
    ).query(
      `update "usager" set migrated = false  where jsonb_array_length(docs) > 0`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
