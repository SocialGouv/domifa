import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AddOtpTable1778582320186 implements MigrationInterface {
  name = "AddOtpTable1778582320186";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `CREATE TABLE "otp" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "email" text NOT NULL, "code" text NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "used" boolean NOT NULL DEFAULT false, "purpose" text, CONSTRAINT "PK_f63f78c8d648a9c53057079b0af" PRIMARY KEY ("uuid"))`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_otp_email_used_expires" ON "otp" ("email", "used", "expiresAt") `
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "prod" || domifaConfig().envId === "preprod") {
      await queryRunner.query(
        `DROP INDEX "public"."IDX_otp_email_used_expires"`
      );
      await queryRunner.query(`DROP TABLE "otp"`);
    }
  }
}
