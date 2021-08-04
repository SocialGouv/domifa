import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class deleteStatsMigration1628083871207 implements MigrationInterface {
  name = "deleteStatsMigration1628083871207";
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn("[MIGRATIO] Delete old stats");
    await queryRunner.query(
      `ALTER TABLE "structure_stats" DROP CONSTRAINT "FK_32881a91eaf51f28d3f9cf09589"`
    );
    await queryRunner.query(`DROP TABLE "structure_stats"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
