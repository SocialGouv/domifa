import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1611148210101 implements MigrationInterface {
  name = "autoMigration1611148210101";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table interactions alter column "dateInteraction" drop default;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table interactions alter column "dateInteraction" set default now();`
    );
  }
}
