import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1778077375651 implements MigrationInterface {
  name = "AutoMigration1778077375651";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app_log" ADD "userStructureId" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "app_log" ADD "userSupervisorId" integer`
    );
    await queryRunner.query(`ALTER TABLE "app_log" ADD "userType" text`);
    await queryRunner.query(`ALTER TABLE "app_log" ADD "usagerUuid" uuid`);
    await queryRunner.query(
      `CREATE INDEX "IDX_9cf79ee5a07df3bb533048b302" ON "app_log" ("userType") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_241b8f7b6b81faf9e763450a04" ON "app_log" ("usagerUuid") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_241b8f7b6b81faf9e763450a04"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9cf79ee5a07df3bb533048b302"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP COLUMN "fonctionDetail"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD "fonctionDetail" character varying(255)`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false}'`
    );
    await queryRunner.query(`ALTER TABLE "app_log" DROP COLUMN "usagerUuid"`);
    await queryRunner.query(`ALTER TABLE "app_log" DROP COLUMN "userType"`);
    await queryRunner.query(
      `ALTER TABLE "app_log" DROP COLUMN "userSupervisorId"`
    );
    await queryRunner.query(
      `ALTER TABLE "app_log" DROP COLUMN "userStructureId"`
    );
  }
}
