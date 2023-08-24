import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1692807783527 implements MigrationInterface {
  name = "AutoMigration1692807783527";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `CREATE TABLE "expired_token" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "userId" integer NOT NULL, "structureId" integer NOT NULL, "token" text NOT NULL, "userProfile" text NOT NULL, CONSTRAINT "PK_3086dda63f863ce61659708e8e7" PRIMARY KEY ("uuid"))`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_728480a55bd9e5daa2a89d8de0" ON "expired_token" ("userId") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_4252acc4e242ad123a5d7b0625" ON "expired_token" ("structureId") `
      );
      await queryRunner.query(
        `ALTER TABLE "expired_token" ADD CONSTRAINT "FK_728480a55bd9e5daa2a89d8de0f" FOREIGN KEY ("userId") REFERENCES "user_structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "expired_token" ADD CONSTRAINT "FK_4252acc4e242ad123a5d7b06252" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expired_token" DROP CONSTRAINT "FK_4252acc4e242ad123a5d7b06252"`
    );
    await queryRunner.query(
      `ALTER TABLE "expired_token" DROP CONSTRAINT "FK_728480a55bd9e5daa2a89d8de0f"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4252acc4e242ad123a5d7b0625"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_728480a55bd9e5daa2a89d8de0"`
    );
    await queryRunner.query(`DROP TABLE "expired_token"`);
  }
}
