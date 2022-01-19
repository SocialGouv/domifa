import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class createContactSupportMigration1642548402220
  implements MigrationInterface
{
  name = "createContactSupportMigration1642548402220";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "prod" || domifaConfig().envId === "preprod") {
      await queryRunner.query(
        `CREATE TABLE "contact_support" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "userId" integer, "structureId" integer, "content" text NOT NULL, "status" text NOT NULL DEFAULT 'ON_HOLD', "file" text, "email" text NOT NULL, "category" text, "name" text NOT NULL, "comments" text, CONSTRAINT "PK_8e4a4781a01061a482fa33e5f5a" PRIMARY KEY ("uuid"))`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_2dc55096563e5e2a6db3b83c0c" ON "contact_support" ("userId") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_d2145fd3e0c677e9f1f9763467" ON "contact_support" ("structureId") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_d92188af7573662f6be7199eda" ON "contact_support" ("status") `
      );
      await queryRunner.query(`ALTER TABLE "log" RENAME TO "app_log"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d92188af7573662f6be7199eda"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d2145fd3e0c677e9f1f9763467"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2dc55096563e5e2a6db3b83c0c"`
    );
    await queryRunner.query(`DROP TABLE "contact_support"`);
  }
}
