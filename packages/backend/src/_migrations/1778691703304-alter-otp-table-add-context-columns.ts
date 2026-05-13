import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AlterOtpTableAddContextColumns1778691703304
  implements MigrationInterface
{
  name = "AlterOtpTableAddContextColumns1778691703304";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(`DELETE FROM "otp"`);
      await queryRunner.query(
        `ALTER TABLE "otp" ADD "fingerprintHash" text NOT NULL`
      );
      await queryRunner.query(`ALTER TABLE "otp" ADD "url" text NOT NULL`);
      await queryRunner.query(`ALTER TABLE "otp" ADD "userUuid" uuid NOT NULL`);
      await queryRunner.query(`ALTER TABLE "otp" ADD "userType" text NOT NULL`);
      await queryRunner.query(
        `ALTER TABLE "otp" ADD "resendCount" integer NOT NULL DEFAULT '0'`
      );
      await queryRunner.query(
        `ALTER TABLE "otp" ADD "usedAt" TIMESTAMP WITH TIME ZONE`
      );
      await queryRunner.query(
        `ALTER TABLE "otp" ALTER COLUMN "purpose" SET NOT NULL`
      );
      await queryRunner.query(
        `DROP INDEX "public"."IDX_otp_email_used_expires"`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_otp_fingerprintHash" ON "otp" ("fingerprintHash")`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "prod" || domifaConfig().envId === "preprod") {
      await queryRunner.query(`DROP INDEX "public"."IDX_otp_fingerprintHash"`);
      await queryRunner.query(
        `CREATE INDEX "IDX_otp_email_used_expires" ON "otp" ("email", "used", "expiresAt")`
      );
      await queryRunner.query(
        `ALTER TABLE "otp" ALTER COLUMN "purpose" DROP NOT NULL`
      );
      await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "usedAt"`);
      await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "resendCount"`);
      await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "userType"`);
      await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "userUuid"`);
      await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "url"`);
      await queryRunner.query(
        `ALTER TABLE "otp" DROP COLUMN "fingerprintHash"`
      );
    }
  }
}
