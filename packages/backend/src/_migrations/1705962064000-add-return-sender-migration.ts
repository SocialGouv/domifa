import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class CreateReturnSenderMigration1705962064000
  implements MigrationInterface
{
  name = "CreateReturnSenderMigration1705962064000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "interactions" ADD "returnToSender" boolean`
      );

      await queryRunner.query(
        `CREATE INDEX "IDX_12b6501ee34f7b56be08b6536d" ON "interactions" ("returnToSender") `
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_12b6501ee34f7b56be08b6536d"`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP COLUMN "returnToSender"`
    );
  }
}
