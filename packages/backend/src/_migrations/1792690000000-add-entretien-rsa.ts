import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEntretienRsa1792690000000 implements MigrationInterface {
  name = "AddEntretienRsa1792690000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Nullable: interviews without any RSA answer stay unanswered.
    await queryRunner.query(
      `ALTER TABLE "usager_entretien" ADD COLUMN IF NOT EXISTS "rsa" boolean`
    );

    // RSA used to be a choice of the "situation professionnelle" question:
    // move it to the dedicated question.
    await queryRunner.query(
      `UPDATE "usager_entretien" SET "rsa" = true, "situationPro" = NULL WHERE "situationPro" = 'RSA'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "usager_entretien" SET "situationPro" = 'RSA' WHERE "rsa" = true AND "situationPro" IS NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_entretien" DROP COLUMN IF EXISTS "rsa"`
    );
  }
}
