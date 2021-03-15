import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1615804855154 implements MigrationInterface {
  name = "autoMigration1615804855154";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "app_user_security" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "userId" integer NOT NULL, "structureId" integer NOT NULL, "temporaryTokens" jsonb, "eventsHistory" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "UQ_cec1c2a0820383d2a4045b5f902" UNIQUE ("userId"), CONSTRAINT "PK_a617f0127221193d06271877ae0" PRIMARY KEY ("uuid"))`
    );
    await queryRunner.query(
      `INSERT INTO app_user_security ("userId", "structureId", "temporaryTokens", "version")
    SELECT id as "userId", "structureId", json_build_object('token', "temporaryTokens"->>'password', 'validity', "temporaryTokens"->>'passwordValidity', 'type', 'reset-password') as "temporaryTokens", 1 as "version"
    FROM public.app_user
    where "temporaryTokens" is not null and ("temporaryTokens"->>'passwordValidity')::timestamptz > now();`
    );

    await queryRunner.query(
      `INSERT INTO app_user_security ("userId", "structureId", "version")
    SELECT id as "userId", "structureId", 1 as "version"
    FROM public.app_user
    where "temporaryTokens" is null or ("temporaryTokens"->>'passwordValidity')::timestamptz <= now();`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cec1c2a0820383d2a4045b5f90" ON "app_user_security" ("userId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4950bb2d2181b91b9219f9039c" ON "app_user_security" ("structureId") `
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" DROP COLUMN "temporaryTokens"`
    );
    await queryRunner.query(
      `ALTER TABLE "app_user_security" ADD CONSTRAINT "FK_cec1c2a0820383d2a4045b5f902" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "app_user_security" ADD CONSTRAINT "FK_4950bb2d2181b91b9219f9039c9" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ALTER COLUMN "userId" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app_user_security" DROP CONSTRAINT "FK_4950bb2d2181b91b9219f9039c9"`
    );
    await queryRunner.query(
      `ALTER TABLE "app_user_security" DROP CONSTRAINT "FK_cec1c2a0820383d2a4045b5f902"`
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" ADD "temporaryTokens" jsonb`
    );
    await queryRunner.query(`DROP INDEX "IDX_4950bb2d2181b91b9219f9039c"`);
    await queryRunner.query(`DROP INDEX "IDX_cec1c2a0820383d2a4045b5f90"`);
    await queryRunner.query(`DROP TABLE "app_user_security"`);
  }
}
