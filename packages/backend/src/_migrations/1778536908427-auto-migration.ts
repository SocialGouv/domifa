import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1778536908427 implements MigrationInterface {
  name = "AutoMigration1778536908427";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "local" ||
      domifaConfig().envId === "preprod"
    ) {
      // user_structure: add status (PENDING default), promote previously-verified
      // accounts to ACTIVE, drop the legacy boolean column.
      await queryRunner.query(
        `ALTER TABLE "user_structure" ADD "status" character varying NOT NULL DEFAULT 'PENDING'`
      );
      await queryRunner.query(
        `UPDATE "user_structure" SET "status" = 'ACTIVE' WHERE "verified" = true`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure" DROP COLUMN "verified"`
      );

      // user_supervisor: same pattern.
      await queryRunner.query(
        `ALTER TABLE "user_supervisor" ADD "status" character varying NOT NULL DEFAULT 'PENDING'`
      );
      await queryRunner.query(
        `UPDATE "user_supervisor" SET "status" = 'ACTIVE' WHERE "verified" = true`
      );
      await queryRunner.query(
        `ALTER TABLE "user_supervisor" DROP COLUMN "verified"`
      );

      // user_usager: no "verified" column historically. A usager who has
      // personalized their password is considered activated; the others stay
      // on the PENDING default until they do.
      await queryRunner.query(
        `ALTER TABLE "user_usager" ADD "status" character varying NOT NULL DEFAULT 'PENDING'`
      );
      await queryRunner.query(
        `UPDATE "user_usager" SET "status" = 'ACTIVE' WHERE "passwordType" = 'PERSONAL'`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
      `ALTER TABLE "user_supervisor" ADD "verified" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `UPDATE "user_supervisor" SET "verified" = false WHERE "status" <> 'ACTIVE'`
    );
    await queryRunner.query(
      `ALTER TABLE "user_supervisor" DROP COLUMN "status"`
    );

    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD "verified" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `UPDATE "user_structure" SET "verified" = false WHERE "status" <> 'ACTIVE'`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP COLUMN "status"`
    );

    await queryRunner.query(`ALTER TABLE "user_usager" DROP COLUMN "status"`);
  }
}
