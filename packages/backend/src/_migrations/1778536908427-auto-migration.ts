import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1778536908427 implements MigrationInterface {
  name = "AutoMigration1778536908427";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "prod" || domifaConfig().envId === "local") {
      await queryRunner.query(
        `ALTER TABLE "user_supervisor" RENAME COLUMN "verified" TO "status"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure" DROP COLUMN "verified"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager" ADD "status" character varying NOT NULL DEFAULT 'ACTIVE'`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure" ADD "status" character varying NOT NULL DEFAULT 'ACTIVE'`
      );
      await queryRunner.query(
        `ALTER TABLE "user_supervisor" DROP COLUMN "status"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_supervisor" ADD "status" character varying NOT NULL DEFAULT 'ACTIVE'`
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
      `ALTER TABLE "user_supervisor" DROP COLUMN "status"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_supervisor" ADD "status" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP COLUMN "status"`
    );
    await queryRunner.query(`ALTER TABLE "user_usager" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD "verified" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "user_supervisor" RENAME COLUMN "status" TO "verified"`
    );
  }
}
