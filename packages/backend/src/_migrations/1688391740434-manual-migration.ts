/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";
import { usagerDocsRepository } from "../database";

export class ManualMigration1688391740434 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    await usagerDocsRepository.update(
      {},
      {
        encryptionContext: null,
        encryptionVersion: 0,
      }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
