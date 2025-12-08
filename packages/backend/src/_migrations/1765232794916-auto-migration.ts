import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1765232794916 implements MigrationInterface {
  name = "AutoMigration1765232794916";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId !== "test") {
      await queryRunner.query(`DROP TABLE message_email`);
      await queryRunner.query(
        `ALTER TABLE "structure" ALTER COLUMN "decision" SET NOT NULL`
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
      `ALTER TABLE "structure" ALTER COLUMN "decision" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false}'`
    );
  }
}
