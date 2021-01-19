import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1607476591678 implements MigrationInterface {
  name = "autoMigration1607476591678";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "structure_doc" (
  "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "version" integer NOT NULL,
  "id" SERIAL NOT NULL,
  "label" text NOT NULL,
  "createdBy" jsonb NOT NULL,
  "tags" jsonb,
  "custom" boolean NOT NULL DEFAULT false,
  "filetype" text NOT NULL,
  "structureId" integer NOT NULL,
  "path" text NOT NULL,
  CONSTRAINT "UQ_b1dfa7ef1934657b38072e749e3" UNIQUE ("id"),
  CONSTRAINT "PK_6d6be27ca865c8ba30b9c862b70" PRIMARY KEY ("uuid")
)`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b1dfa7ef1934657b38072e749e" ON "structure_doc" ("id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d79d466c870df0b58864836899" ON "structure_doc" ("structureId") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_d79d466c870df0b58864836899"`);
    await queryRunner.query(`DROP INDEX "IDX_b1dfa7ef1934657b38072e749e"`);
    await queryRunner.query(`DROP TABLE "structure_doc"`);
  }
}
