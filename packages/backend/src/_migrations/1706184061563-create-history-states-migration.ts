import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1706184061563 implements MigrationInterface {
  name = "AutoMigration1706184061563";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `CREATE TABLE "usager_history_states" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "usagerUUID" uuid NOT NULL, "usagerRef" integer NOT NULL, "structureId" integer NOT NULL, "ayantsDroits" jsonb NOT NULL, "decision" jsonb NOT NULL, "entretien" jsonb NOT NULL, "rdv" jsonb, "createdEvent" text NOT NULL, "historyBeginDate" TIMESTAMP WITH TIME ZONE NOT NULL, "historyEndDate" TIMESTAMP WITH TIME ZONE, "isActive" boolean DEFAULT false, "migrated" boolean NOT NULL DEFAULT false, "typeDom" text DEFAULT 'PREMIERE_DOM', "etapeDemande" integer NOT NULL DEFAULT '0',  CONSTRAINT "PK_c1bd0d42891df5715d2ef8474d7" PRIMARY KEY ("uuid"))`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_e819c8b113a23a4a0c13a741da" ON "usager_history_states" ("usagerUUID") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_85ac9012f78c974fb73a5352df" ON "usager_history_states" ("structureId") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_b86af851802a2a2f3a2ab549e8" ON "usager_history_states" ("createdEvent") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_9beb1346c63a45ba7c15db9ee7" ON "usager_history_states" ("historyBeginDate") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_7ed0bb63b8fc294757b8bd8854" ON "usager_history_states" ("historyEndDate") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_78061fee381f67924d9a659dc6" ON "usager_history_states" ("isActive") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_f11adaadacdb25438cf2f92f1f" ON "usager_history_states" ("typeDom") `
      );
      await queryRunner.query(
        `ALTER TABLE "usager_history_states" ADD CONSTRAINT "FK_e819c8b113a23a4a0c13a741da0" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_history_states" DROP CONSTRAINT "FK_85ac9012f78c974fb73a5352dfe"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_history_states" DROP CONSTRAINT "FK_e819c8b113a23a4a0c13a741da0"`
    );

    await queryRunner.query(
      `DROP INDEX "public"."IDX_f11adaadacdb25438cf2f92f1f"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_78061fee381f67924d9a659dc6"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7ed0bb63b8fc294757b8bd8854"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9beb1346c63a45ba7c15db9ee7"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b86af851802a2a2f3a2ab549e8"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_85ac9012f78c974fb73a5352df"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e819c8b113a23a4a0c13a741da"`
    );
    await queryRunner.query(`DROP TABLE "usager_history_states"`);
  }
}
