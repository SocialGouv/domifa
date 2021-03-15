import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1614764557422 implements MigrationInterface {
  name = "autoMigration1614764557422";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "message_sms" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "usagerRef" integer NOT NULL, "structureId" integer NOT NULL, "content" text NOT NULL, "status" text NOT NULL DEFAULT 'TO_SEND', "smsId" text NOT NULL, "scheduledDate" TIMESTAMP WITH TIME ZONE NOT NULL, "sendDate" TIMESTAMP WITH TIME ZONE, "interactionMetas" jsonb, "reminderMetas" jsonb, "statusUpdates" jsonb, "lastUpdate" TIMESTAMP WITH TIME ZONE, "errorCount" integer NOT NULL DEFAULT 0, "errorMessage" text, CONSTRAINT "PK_4d9f00a5bf0f7f424985b156043" PRIMARY KEY ("uuid"))`
    );

    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{ enabledByDomifa: false, enabledByStructure: false, senderName: null, senderDetails: null }'`
    );

    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"email": false, "phone": false, "phoneNumber":null}'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "sms"`);
    await queryRunner.query(`DROP TABLE "message_sms"`);
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"email": false, "phone": false}'`
    );
  }
}
