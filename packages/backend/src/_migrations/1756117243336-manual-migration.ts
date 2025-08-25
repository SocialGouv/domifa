import { MigrationInterface, QueryRunner } from "typeorm";

export class ManualMigration1756117243336 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "app_log"
      SET action = CASE
        WHEN action = 'DOWNLOAD_IMPORT_GUIDE' THEN 'IMPORT_DOWNLOAD_GUIDE'
        WHEN action = 'DOWNLOAD_IMPORT_TEMPLATE' THEN 'IMPORT_TEMPLATE_DOWNLOAD'
        ELSE action
      END
      WHERE action IN ('DOWNLOAD_IMPORT_GUIDE', 'DOWNLOAD_IMPORT_TEMPLATE');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "app_log"
      SET action = CASE
        WHEN action = 'IMPORT_DOWNLOAD_GUIDE' THEN 'DOWNLOAD_IMPORT_GUIDE'
        WHEN action = 'IMPORT_TEMPLATE_DOWNLOAD' THEN 'DOWNLOAD_IMPORT_TEMPLATE'
        ELSE action
      END
      WHERE action IN ('IMPORT_DOWNLOAD_GUIDE', 'IMPORT_TEMPLATE_DOWNLOAD');
    `);
  }
}
