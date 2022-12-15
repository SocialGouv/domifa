import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class autoMigration1671120114644 implements MigrationInterface {
  name = "autoMigration1671120114644";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId !== "test" && domifaConfig().envId !== "dev") {
      await queryRunner.query(`ALTER TABLE "usager" DROP COLUMN "oldNotes"`);
    } else {
      console.log("Migration done ");
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" ADD "oldNotes" jsonb NOT NULL DEFAULT '[]'`
    );
  }
}
