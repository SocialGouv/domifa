import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1779831941536 implements MigrationInterface {
  name = "AutoMigration1779831941536";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(`DROP INDEX "public"."IDX_otp_fingerprintHash"`);
      await queryRunner.query(
        `CREATE TABLE "app_log_security" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "userStructureId" integer, "userSupervisorId" integer, "userType" text, "structureId" integer, "action" text NOT NULL, "context" json, "role" text, "createdBy" text, "ip" text, "userAgent" text, CONSTRAINT "PK_f023f98c94291671126bdb9f3ab" PRIMARY KEY ("uuid"))`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_app_log_security_userType" ON "app_log_security" ("userType") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_app_log_security_ip" ON "app_log_security" ("ip") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_app_log_security_action_createdAt" ON "app_log_security" ("action", "createdAt") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_a57270a45922d90069d3780bed" ON "otp" ("fingerprintHash") `
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a57270a45922d90069d3780bed"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP COLUMN "fonctionDetail"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD "fonctionDetail" character varying(255)`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false}'`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_app_log_security_action_createdAt"`
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_app_log_security_ip"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_app_log_security_userType"`
    );
    await queryRunner.query(`DROP TABLE "app_log_security"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_otp_fingerprintHash" ON "otp" ("fingerprintHash") `
    );
  }
}
