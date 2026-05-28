import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1780006352188 implements MigrationInterface {
  name = "AutoMigration1780006352188";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "user_supervisor_security" DROP COLUMN "eventsHistory"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure_security" DROP COLUMN "eventsHistory"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager_security" DROP COLUMN "eventsHistory"`
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
      `ALTER TABLE "user_usager_security" ADD "eventsHistory" jsonb NOT NULL DEFAULT '[]'`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" ADD "eventsHistory" jsonb NOT NULL DEFAULT '[]'`
    );
    await queryRunner.query(
      `ALTER TABLE "user_supervisor_security" ADD "eventsHistory" jsonb NOT NULL DEFAULT '[]'`
    );
  }
}
