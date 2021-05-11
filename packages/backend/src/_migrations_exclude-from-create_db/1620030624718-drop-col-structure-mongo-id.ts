import { MigrationInterface, QueryRunner } from "typeorm";

export class manualMigration1620030624718 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE public."structure" DROP COLUMN "mongoStructureId";`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
