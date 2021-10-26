import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1635284015004 implements MigrationInterface {
  name = "autoMigration1635284015004";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false}'`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP COLUMN "dateInteraction"`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ADD "dateInteraction" TIMESTAMP WITH TIME ZONE NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ALTER COLUMN "verified" SET DEFAULT true`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_structure" ALTER COLUMN "verified" SET DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP COLUMN "dateInteraction"`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ADD "dateInteraction" TIMESTAMP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": false, "enabledByStructure": false}'`
    );
  }
}
