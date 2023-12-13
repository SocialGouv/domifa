import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1702483465656 implements MigrationInterface {
  name = "AutoMigration1702483465656";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(`ALTER TABLE "open_data_places" ADD "mail" text`);

      await queryRunner.query(
        `ALTER TABLE "open_data_places" ADD "structureType" text`
      );

      await queryRunner.query(
        `ALTER TABLE "open_data_places" DROP CONSTRAINT "FK_d10ac71fca9180b787ef468659e"`
      );
      await queryRunner.query(
        `DROP INDEX "public"."IDX_d10ac71fca9180b787ef468659"`
      );
      await queryRunner.query(
        `ALTER TABLE "open_data_places" DROP COLUMN "structureId"`
      );
      await queryRunner.query(
        `ALTER TABLE "open_data_places" ADD "domifaStructureId" integer`
      );
      await queryRunner.query(
        `ALTER TABLE "open_data_places" ADD "soliguideStructureId" integer`
      );

      await queryRunner.query(
        `CREATE INDEX "IDX_7ee1e7a8d9441eb76ab7b4aa5a" ON "open_data_places" ("domifaStructureId") `
      );
      await queryRunner.query(
        `ALTER TABLE "open_data_places" ADD CONSTRAINT "FK_7ee1e7a8d9441eb76ab7b4aa5a3" FOREIGN KEY ("domifaStructureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
    }
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "open_data_places" DROP CONSTRAINT "FK_7ee1e7a8d9441eb76ab7b4aa5a3"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7ee1e7a8d9441eb76ab7b4aa5a"`
    );

    await queryRunner.query(
      `ALTER TABLE "open_data_places" DROP COLUMN "soliguideStructureId"`
    );
    await queryRunner.query(
      `ALTER TABLE "open_data_places" DROP COLUMN "domifaStructureId"`
    );
    await queryRunner.query(
      `ALTER TABLE "open_data_places" ADD "structureId" integer`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d10ac71fca9180b787ef468659" ON "open_data_places" ("structureId") `
    );
    await queryRunner.query(
      `ALTER TABLE "open_data_places" ADD CONSTRAINT "FK_d10ac71fca9180b787ef468659e" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }
}
