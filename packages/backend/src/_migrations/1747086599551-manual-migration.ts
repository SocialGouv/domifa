import { MigrationInterface, QueryRunner } from "typeorm";
import { userStructureRepository } from "../database";

export class ManualMigration1747086599551 implements MigrationInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(_queryRunner: QueryRunner): Promise<void> {
    await userStructureRepository.update({}, { acceptTerms: null });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
