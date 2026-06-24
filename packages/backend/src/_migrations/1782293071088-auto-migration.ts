import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1782293071088 implements MigrationInterface {
  name = "AutoMigration1782293071088";

  private static readonly ALLOWED_ENVS = ["prod", "preprod", "local"];

  private isAllowedEnv(): boolean {
    return AutoMigration1782293071088.ALLOWED_ENVS.includes(
      process.env.DOMIFA_ENV_ID ?? ""
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!this.isAllowedEnv()) {
      return;
    }
    await queryRunner.query(
      `ALTER TABLE "structure" ADD "organismeTypeDetail" text`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!this.isAllowedEnv()) {
      return;
    }
    await queryRunner.query(
      `ALTER TABLE "structure" DROP COLUMN "organismeTypeDetail"`
    );
  }
}
