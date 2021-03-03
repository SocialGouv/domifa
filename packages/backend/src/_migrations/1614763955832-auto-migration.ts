import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1614763955832 implements MigrationInterface {
  name = "autoMigration1614763955832";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "message_sms" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "usagerRef" integer NOT NULL, "structureId" integer NOT NULL, "content" text NOT NULL, "status" text NOT NULL DEFAULT 'TO_SEND', "smsId" text NOT NULL, "scheduledDate" TIMESTAMP WITH TIME ZONE NOT NULL, "sentDate" TIMESTAMP WITH TIME ZONE, "interactionMetas" jsonb, "reminderMetas" jsonb, "statusUpdates" jsonb, "lastUpdate" TIMESTAMP WITH TIME ZONE, "errorCount" integer NOT NULL DEFAULT 0, "errorMessage" text, CONSTRAINT "PK_4d9f00a5bf0f7f424985b156043" PRIMARY KEY ("uuid"))`
    );
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "lastExport"`);
    await queryRunner.query(
      `ALTER TABLE "structure" ADD "sms" jsonb NOT NULL DEFAULT '{ enabled: false, senderName: null, senderDetails: null }'`
    );
    await queryRunner.query(
      `ALTER TABLE "monitor_batch_process" ADD "alertMailSent" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ADD CONSTRAINT "UQ_870780802d799a6c16a6a86e40e" UNIQUE ("mongoStructureId")`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ALTER COLUMN "userId" DROP NOT NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_870780802d799a6c16a6a86e40" ON "structure" ("mongoStructureId") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_870780802d799a6c16a6a86e40"`);
    await queryRunner.query(
      `ALTER TABLE "interactions" ALTER COLUMN "userId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" DROP CONSTRAINT "UQ_870780802d799a6c16a6a86e40e"`
    );
    await queryRunner.query(
      `ALTER TABLE "monitor_batch_process" DROP COLUMN "alertMailSent"`
    );
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "sms"`);
    await queryRunner.query(`ALTER TABLE "structure" ADD "lastExport" date`);
    await queryRunner.query(`DROP TABLE "message_sms"`);
  }
}
