import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1606839814470 implements MigrationInterface {
  name = "autoMigration1606839814470";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "message_email" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "status" text NOT NULL, "emailId" text NOT NULL, "initialScheduledDate" TIMESTAMP WITH TIME ZONE NOT NULL, "nextScheduledDate" TIMESTAMP WITH TIME ZONE NOT NULL, "sendDate" TIMESTAMP WITH TIME ZONE, "content" jsonb NOT NULL, "errorCount" integer NOT NULL DEFAULT 0, "errorMessage" text, "sendDetails" jsonb, CONSTRAINT "PK_6bffd9b803b67cd4e099fc795e1" PRIMARY KEY ("uuid"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "message_email"`);
  }
}
