import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1699283951968 implements MigrationInterface {
  name = "AutoMigration1699283951968";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_416154ec3c1e8fe5a96715b855"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9992157cbe54583ff7002ae4c0"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_9992157cbe54583ff7002ae4c0" ON "interactions" ("userId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_416154ec3c1e8fe5a96715b855" ON "interactions" ("nbCourrier") `
    );
  }
}
