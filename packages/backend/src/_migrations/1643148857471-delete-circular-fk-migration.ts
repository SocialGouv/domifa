import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class deleteCircularFkMigration1643148857471
  implements MigrationInterface
{
  name = "deleteCircularFkMigration1643148857471";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "prod" || domifaConfig().envId === "preprod") {
      await queryRunner.query(
        `DROP INDEX "public"."IDX_495b59d0dd15e43b262f2da890"`
      );

      await queryRunner.query(
        `CREATE INDEX "IDX_495b59d0dd15e43b262f2da890" ON "interactions" ("interactionOutUUID") `
      );

      await queryRunner.query(
        `ALTER TABLE "interactions" DROP CONSTRAINT "FK_495b59d0dd15e43b262f2da8907"`
      );

      await queryRunner.query(
        `ALTER TABLE "message_email" DROP COLUMN "attachments"`
      );
      await queryRunner.query(
        `ALTER TABLE "message_email" ADD "attachments" jsonb`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_495b59d0dd15e43b262f2da890"`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_495b59d0dd15e43b262f2da890" ON "interactions" ("interactionOutUUID") `
    );

    await queryRunner.query(
      `ALTER TABLE "interactions" ADD CONSTRAINT "FK_495b59d0dd15e43b262f2da8907" FOREIGN KEY ("interactionOutUUID") REFERENCES "interactions"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
