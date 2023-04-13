import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1680517639548 implements MigrationInterface {
  name = "autoMigration1680517639548";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_4a2ef430c9c7a9b4a66db96ec7" ON "interactions" ("dateInteraction") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_416154ec3c1e8fe5a96715b855" ON "interactions" ("nbCourrier") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_416154ec3c1e8fe5a96715b855"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4a2ef430c9c7a9b4a66db96ec7"`
    );
  }
}
