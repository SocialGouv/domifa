import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class autoMigration1657800960499 implements MigrationInterface {
  name = "autoMigration1657800960499";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(`ALTER TABLE "usager" DROP COLUMN "docs"`);
      await queryRunner.query(`ALTER TABLE "usager" DROP COLUMN "docsPath"`);

      await queryRunner.query(
        `ALTER TABLE "usager_docs" ADD CONSTRAINT "FK_08c4299b8abc6b9f548f2aece20" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_docs" ADD CONSTRAINT "FK_b1db67565e53acec53d5f3aa926" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP CONSTRAINT "FK_0389a8aa8e69b2d17210745d040"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_docs" DROP CONSTRAINT "FK_b1db67565e53acec53d5f3aa926"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_docs" DROP CONSTRAINT "FK_08c4299b8abc6b9f548f2aece20"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" ADD CONSTRAINT "UQ_cec1c2a0820383d2a4045b5f902" UNIQUE ("userId")`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" ADD CONSTRAINT "FK_0389a8aa8e69b2d17210745d040" FOREIGN KEY ("userId") REFERENCES "user_structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ADD "docsPath" jsonb NOT NULL DEFAULT '[]'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ADD "docs" jsonb NOT NULL DEFAULT '[]'`
    );
  }
}
