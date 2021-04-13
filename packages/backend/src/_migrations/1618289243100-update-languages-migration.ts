import { MigrationInterface, QueryRunner } from "typeorm";

export class manualMigration1618289243100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE usager
        SET "langue"=NULL
        WHERE usager."langue"=''`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
