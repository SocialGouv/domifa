/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class updateDateInteractionMigration1647533712904
  implements MigrationInterface
{
  name = "updateDateInteractionMigration1647533712904";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "interactions" ALTER "dateInteraction" TYPE timestamptz;`
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
