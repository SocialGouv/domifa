import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1751465948377 implements MigrationInterface {
  name = "AutoMigration1751465948377";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "options" SET DEFAULT '{"numeroBoite": true, "surnom": false}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"countryCode": "fr", "numero": ""}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false, "schedule" :{ "monday": false "tuesday": false "wednesday": false "thursday": false "friday": false } }'`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP COLUMN "detailFonction"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD "detailFonction" text`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b2ad525cbadf911e833bf61597" ON "open_data_places" ("cityCode") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b2ad525cbadf911e833bf61597"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP COLUMN "detailFonction"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD "detailFonction" character varying(255)`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "options" DROP DEFAULT`
    );
  }
}
