import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1759327920930 implements MigrationInterface {
  name = "AutoMigration1759327920930";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "verified"`);
    await queryRunner.query(
      `ALTER TABLE "structure" ADD "statut" text NOT NULL DEFAULT 'EN_ATTENTE'`
    );
    await queryRunner.query(`ALTER TABLE "structure" ADD "statutDetail" text`);
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false, "schedule" :{ "monday": false "tuesday": true "wednesday": false "thursday": true "friday": false } }'`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP COLUMN "fonctionDetail"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD "fonctionDetail" text`
    );
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
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" DROP COLUMN "statutDetail"`
    );
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "statut"`);
    await queryRunner.query(
      `ALTER TABLE "structure" ADD "verified" boolean NOT NULL DEFAULT false`
    );
  }
}
