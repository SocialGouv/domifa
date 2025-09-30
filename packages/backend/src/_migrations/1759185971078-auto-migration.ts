import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1759185971078 implements MigrationInterface {
  name = "AutoMigration1759185971078";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(`
            UPDATE "structure"
            SET "options" = jsonb_set(
                COALESCE("options", '{}'::jsonb),
                '{nomStructure}',
                'true'::jsonb,
                true
            )
        `);
    }
  }

  public async down(): Promise<void> {}
}
