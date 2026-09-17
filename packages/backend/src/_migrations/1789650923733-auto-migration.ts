import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1789650923733 implements MigrationInterface {
  name = "AutoMigration1789650923733";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_supervisor" ADD "emailDeliveryIssue" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "user_supervisor" ADD "preferredEmailSender" text`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD "emailDeliveryIssue" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD "preferredEmailSender" text`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP COLUMN "preferredEmailSender"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP COLUMN "emailDeliveryIssue"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_supervisor" DROP COLUMN "preferredEmailSender"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_supervisor" DROP COLUMN "emailDeliveryIssue"`
    );
  }
}
