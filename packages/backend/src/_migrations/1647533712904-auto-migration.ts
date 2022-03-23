import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1647533712904 implements MigrationInterface {
  name = "autoMigration1647533712904";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interactions" ALTER "dateInteraction" TYPE timestamptz;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
