import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1730216743164 implements MigrationInterface {
  name = "AutoMigration1730216743164";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "usager_docs" ADD "shared" boolean NOT NULL DEFAULT false`
      );

      await queryRunner.query(
        `UPDATE "structure_doc" SET label = 'Attestation postale' where label='attestation_postale'`
      );
      await queryRunner.query(
        `UPDATE "structure_doc" SET label = 'Courrier de radiation' where label='courrier_radiation'`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "usager_docs" DROP COLUMN "shared"`);
  }
}
