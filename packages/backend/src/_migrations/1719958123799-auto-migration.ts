import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1719958123799 implements MigrationInterface {
  name = "AutoMigration1719958123799";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `DROP INDEX "public"."IDX_2dc55096563e5e2a6db3b83c0c"`
      );
      await queryRunner.query(
        `DROP INDEX "public"."IDX_d2145fd3e0c677e9f1f9763467"`
      );
      await queryRunner.query(
        `DROP INDEX "public"."IDX_d92188af7573662f6be7199eda"`
      );
      await queryRunner.query(
        `DROP INDEX "public"."IDX_32f34de1c043658f4843e62218"`
      );
      await queryRunner.query(
        `DROP INDEX "public"."IDX_12b6501ee34f7b56be08b6536d"`
      );
      await queryRunner.query(
        `DROP INDEX "public"."IDX_b3d70227bb45dd8060e256ee33"`
      );
      await queryRunner.query(
        `DROP INDEX "public"."IDX_78061fee381f67924d9a659dc6"`
      );
      await queryRunner.query(
        `DROP INDEX "public"."IDX_b86af851802a2a2f3a2ab549e8"`
      );
      await queryRunner.query(
        `DROP INDEX "public"."IDX_f11adaadacdb25438cf2f92f1f"`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_history_states" DROP COLUMN "usagerRef"`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_history_states" DROP COLUMN "migrated"`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_history_states" DROP COLUMN "etapeDemande"`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_history_states" ADD "etapeDemande" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_history_states" ADD "migrated" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_history_states" ADD "usagerRef" integer NOT NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f11adaadacdb25438cf2f92f1f" ON "usager_history_states" ("typeDom") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b86af851802a2a2f3a2ab549e8" ON "usager_history_states" ("createdEvent") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_78061fee381f67924d9a659dc6" ON "usager_history_states" ("isActive") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b3d70227bb45dd8060e256ee33" ON "interactions" ("procuration") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_12b6501ee34f7b56be08b6536d" ON "interactions" ("returnToSender") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_32f34de1c043658f4843e62218" ON "usager" ("typeDom") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d92188af7573662f6be7199eda" ON "contact_support" ("status") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d2145fd3e0c677e9f1f9763467" ON "contact_support" ("structureId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2dc55096563e5e2a6db3b83c0c" ON "contact_support" ("userId") `
    );
  }
}
