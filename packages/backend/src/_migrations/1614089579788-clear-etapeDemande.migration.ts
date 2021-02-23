import { MigrationInterface, QueryRunner } from "typeorm";

export class manualMigration1614089579788 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE usager SET "etapeDemande" = 5 where "etapeDemande" = 6;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
