import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1718711481881 implements MigrationInterface {
  name = "AutoMigration1718711481881";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure_stats_reporting" DROP COLUMN "waitingTime"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."structure_stats_reporting_waitingtime_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "structure_stats_reporting" ADD "waitingTime" text`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bf49c177bbacd36423531ecc07" ON "structure" ("departmentName") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2877f8c3f6cbddc785bf938d0a" ON "structure" ("regionName") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b3d70227bb45dd8060e256ee33" ON "interactions" ("procuration") `
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_login" ADD CONSTRAINT "FK_4bf76763fec5203f945338a0377" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_login" ADD CONSTRAINT "FK_8722e56ff917692645abcd29e7c" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "expired_token" ADD CONSTRAINT "FK_728480a55bd9e5daa2a89d8de0f" FOREIGN KEY ("userId") REFERENCES "user_structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "expired_token" ADD CONSTRAINT "FK_4252acc4e242ad123a5d7b06252" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "open_data_places" ADD CONSTRAINT "FK_7ee1e7a8d9441eb76ab7b4aa5a3" FOREIGN KEY ("domifaStructureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_history_states" ADD CONSTRAINT "FK_e819c8b113a23a4a0c13a741da0" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_history_states" ADD CONSTRAINT "FK_85ac9012f78c974fb73a5352dfe" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_history_states" DROP CONSTRAINT "FK_85ac9012f78c974fb73a5352dfe"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_history_states" DROP CONSTRAINT "FK_e819c8b113a23a4a0c13a741da0"`
    );
    await queryRunner.query(
      `ALTER TABLE "open_data_places" DROP CONSTRAINT "FK_7ee1e7a8d9441eb76ab7b4aa5a3"`
    );
    await queryRunner.query(
      `ALTER TABLE "expired_token" DROP CONSTRAINT "FK_4252acc4e242ad123a5d7b06252"`
    );
    await queryRunner.query(
      `ALTER TABLE "expired_token" DROP CONSTRAINT "FK_728480a55bd9e5daa2a89d8de0f"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_login" DROP CONSTRAINT "FK_8722e56ff917692645abcd29e7c"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_login" DROP CONSTRAINT "FK_4bf76763fec5203f945338a0377"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b3d70227bb45dd8060e256ee33"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2877f8c3f6cbddc785bf938d0a"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bf49c177bbacd36423531ecc07"`
    );
    await queryRunner.query(
      `ALTER TABLE "structure_stats_reporting" DROP COLUMN "waitingTime"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."structure_stats_reporting_waitingtime_enum" AS ENUM('ONE_WEEK', 'TWO_WEEKS', 'ONE_MONTH', 'ONE_TO_SIX_MONTHS', 'MORE_THAN_SIX_MONTHS')`
    );
    await queryRunner.query(
      `ALTER TABLE "structure_stats_reporting" ADD "waitingTime" "public"."structure_stats_reporting_waitingtime_enum"`
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
