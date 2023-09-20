import { MigrationInterface, QueryRunner } from "typeorm";
import { EXECUTE_MIGRATIONS } from "../database";

export class AutoMigration1695043582855 implements MigrationInterface {
  name = "AutoMigration1695043582855";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (EXECUTE_MIGRATIONS) {
      console.log("[MIGRATION] Création de 'location' dans les structures");
      await queryRunner.query(
        `ALTER TABLE "structure" ADD "latitude" double precision`
      );
      await queryRunner.query(
        `ALTER TABLE "structure" ADD "longitude" double precision`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "location"`);
  }
}
