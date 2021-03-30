import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1617133186975 implements MigrationInterface {
  name = "autoMigration1617133186975";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "message_sms"`);

    await queryRunner.query(`ALTER TABLE "message_sms" ADD "responseId" text`);

    await queryRunner.query(
      `ALTER TABLE "message_sms" ADD "phoneNumber" text NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "message_sms" ADD "senderName" text NOT NULL`
    );

    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{ "enabledByDomifa": false, "enabledByStructure": false, "senderName": null, "senderDetails": null }'`
    );

    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"email": false, "phone": false, "phoneNumber":null}'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"email": false, "phone": false, "phoneNumber": null}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": false, "enabledByStructure": false}'`
    );

    await queryRunner.query(
      `ALTER TABLE "message_sms" DROP COLUMN "senderName"`
    );
    await queryRunner.query(
      `ALTER TABLE "message_sms" DROP COLUMN "responseId"`
    );
    await queryRunner.query(
      `ALTER TABLE "message_sms" DROP COLUMN "phoneNumber"`
    );
  }
}
