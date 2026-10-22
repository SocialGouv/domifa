import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSupportSessionReason1792661823057
  implements MigrationInterface
{
  name = "AddSupportSessionReason1792661823057";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Nullable: attachments opened before this column existed have no reason.
    await queryRunner.query(
      `ALTER TABLE "support_session" ADD COLUMN IF NOT EXISTS "reason" text`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "support_session" DROP COLUMN IF EXISTS "reason"`
    );
  }
}
