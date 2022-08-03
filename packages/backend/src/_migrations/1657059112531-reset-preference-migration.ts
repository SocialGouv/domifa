import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class resetPreferenceMigration1657059112531
  implements MigrationInterface
{
  name = "resetPreferenceMigration1657059112531";

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log(
      "\n[MIGRATION] resetPreferenceMigration1657059112531 -  START\n"
    );
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `UPDATE "usager" u set phone = NULL where phone = '' OR phone = '0600000000' OR phone = '0606060606'`
      );
    }

    console.log("\n[MIGRATION] resetPreferenceMigration1657059112531 -  END\n");
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
