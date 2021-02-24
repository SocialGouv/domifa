import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class manualMigration1614089579788 implements MigrationInterface {
  name = "manualMigration1614089579788";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP "${this.name}"`);
    await queryRunner.query(
      `UPDATE usager SET "etapeDemande" = 5 where "etapeDemande" = 6;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
