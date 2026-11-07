import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserStructureAccountRulesAcknowledgedAt1793714960257
  implements MigrationInterface
{
  name = "AddUserStructureAccountRulesAcknowledgedAt1793714960257";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Nullable: existing users must acknowledge the new account rules
    // through the "Évolution des règles" modal.
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD COLUMN IF NOT EXISTS "accountRulesAcknowledgedAt" timestamptz`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP COLUMN IF EXISTS "accountRulesAcknowledgedAt"`
    );
  }
}
