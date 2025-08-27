import { MigrationInterface, QueryRunner } from "typeorm";

export class ManualMigration1756117243337 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE app_log
            SET action = 'USAGER_DELETE'
            WHERE action = 'SUPPRIMER_DOMICILIE'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE app_log
            SET action = 'SUPPRIMER_DOMICILIE'
            WHERE action = 'USAGER_DELETE'
        `);
  }
}
