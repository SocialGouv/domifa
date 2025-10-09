import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1760044365787 implements MigrationInterface {
  name = "AutoMigration1760044365787";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "expired_token" DROP CONSTRAINT "FK_4252acc4e242ad123a5d7b06252"`
      );
      await queryRunner.query(
        `ALTER TABLE "expired_token" ALTER COLUMN "structureId" DROP NOT NULL`
      );
      await queryRunner.query(
        `ALTER TABLE "expired_token" ADD CONSTRAINT "FK_4252acc4e242ad123a5d7b06252" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expired_token" ALTER COLUMN "structureId" SET NOT NULL`
    );
  }
}
