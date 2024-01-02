/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";
import { usagerRepository } from "../database";
import { appLogger } from "../util";

export class FixLastInteractionMigration1703676787762
  implements MigrationInterface
{
  public async up(_queryRunner: QueryRunner): Promise<void> {
    appLogger.info(`Update Migration variable`);

    await usagerRepository.update({ migrated: true }, { migrated: false });
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    //}
  }
}
