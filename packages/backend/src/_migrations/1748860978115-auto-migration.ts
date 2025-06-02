import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { structureDocRepository } from "../database";

export class AutoMigration1748860978115 implements MigrationInterface {
  name = "AutoMigration1748860978115";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(_queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await structureDocRepository.update({}, { encryptionContext: null });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
