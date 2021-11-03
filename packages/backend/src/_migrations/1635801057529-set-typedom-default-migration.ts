import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class autoMigration1635801057529 implements MigrationInterface {
  name = "setTypeDomDefault1635801057529";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn(`[${this.name}] MIGRATION UP...`);
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "typeDom" SET DEFAULT 'PREMIERE_DOM'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "typeDom" SET DEFAULT 'INSTRUCTION'`
    );
  }
}
