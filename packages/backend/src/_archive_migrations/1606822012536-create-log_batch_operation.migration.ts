import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1606822012536 implements MigrationInterface {
  name = "autoMigration1606822012536";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "log_batch_operation" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "processId" text NOT NULL, "beginDate" TIMESTAMP WITH TIME ZONE NOT NULL, "endDate" TIMESTAMP WITH TIME ZONE NOT NULL, "trigger" text NOT NULL, "status" text NOT NULL, "details" jsonb, "errorMessage" text, CONSTRAINT "PK_f00131d757d1ddf39e70901e372" PRIMARY KEY ("uuid"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "log_batch_operation"`);
  }
}
