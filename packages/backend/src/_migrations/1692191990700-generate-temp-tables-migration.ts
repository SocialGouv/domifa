import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1692191990700 implements MigrationInterface {
  name = "AutoMigration1692191990700";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const checkIfExists: { exists: boolean } =
      await queryRunner.query(`SELECT EXISTS (
      SELECT FROM
          pg_tables
      WHERE
          schemaname = 'public' AND
          tablename  = 'TmpHistorique'
      );`);

    if (!checkIfExists.exists) {
      await queryRunner.query(
        `CREATE TABLE "TmpHistorique" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "id_domicilie" integer, "date" integer, "type" character varying, CONSTRAINT "PK_523a02c717798d1433428afd730" PRIMARY KEY ("uuid"))`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_9e9c1ff1cb8c52d25db6bf797f" ON "TmpHistorique" ("id_domicilie") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_3acc64a514fefafef16717cb93" ON "TmpHistorique" ("type") `
      );
      await queryRunner.query(
        `CREATE TABLE "TmpCourriers" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "IDDomicilie" integer, "date" integer, "Date_recup" integer, "motif" integer, CONSTRAINT "PK_8520f03ab40677e4503ae9fdf0a" PRIMARY KEY ("uuid"))`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_9b82e742c9c3762d05a73b6a40" ON "TmpCourriers" ("IDDomicilie") `
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "TmpHistorique"`);
  }
}
