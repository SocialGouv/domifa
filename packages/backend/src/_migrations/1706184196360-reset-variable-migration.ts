/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";
import { usagerHistoryRepository } from "../database";

export class AutoMigration1706184196360 implements MigrationInterface {
  name = "AutoMigration1706184196360";

  public async up(_queryRunner: QueryRunner): Promise<void> {
    console.log("Reset migration variable");
    await usagerHistoryRepository.update({}, { migrated: false });
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    ///
  }
}
