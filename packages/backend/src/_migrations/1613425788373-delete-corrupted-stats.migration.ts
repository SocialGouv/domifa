import { MigrationInterface, QueryRunner } from "typeorm";

export class manualMigration1613425788373 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM structure_stats WHERE "generated" IN (true)`
    );
    await queryRunner.query(
      `DELETE FROM structure_stats WHERE "createdAt" <= '2021-02-20'::timestamp and "createdAt" >= '2020-12-30'::timestamp`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
