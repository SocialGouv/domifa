/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteEventsDeletedMigration1698872833486
  implements MigrationInterface
{
  name = "DeleteEventsDeletedMigration1698872833486";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE from interactions where event = 'delete'`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
