import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1755523274895 implements MigrationInterface {
  name = "AutoMigration1755523274895";

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log("🚀 Starting password type migration");

    // Initial stats
    const initialStats = await queryRunner.query(`
      SELECT
        COUNT(*) as "totalAccounts",
        COUNT(*) FILTER (WHERE "isTemporaryPassword" = true) as "temporaryPasswords",
        COUNT(*) FILTER (WHERE "isTemporaryPassword" = false) as "personalPasswords"
      FROM user_usager
    `);

    console.log(`📊 Initial stats:`, initialStats[0]);

    // Update RANDOM pour tous les mots de passe temporaires
    const randomResult = await queryRunner.query(`
      UPDATE user_usager
      SET "passwordType" = 'RANDOM'
      WHERE "isTemporaryPassword" = true
    `);

    console.log(`✅ Set ${randomResult[1]} accounts to RANDOM type`);

    // Update PERSONAL pour tous les mots de passe personnels
    const personalResult = await queryRunner.query(`
      UPDATE user_usager
      SET "passwordType" = 'PERSONAL'
      WHERE "isTemporaryPassword" = false
    `);

    console.log(`✅ Set ${personalResult[1]} accounts to PERSONAL type`);

    // Verification qu'aucun compte n'a passwordType NULL
    const nullPasswordTypes = await queryRunner.query(`
      SELECT COUNT(*) as "nullCount"
      FROM user_usager
      WHERE "passwordType" IS NULL
    `);

    if (nullPasswordTypes[0].nullCount > 0) {
      throw new Error(
        `❌ Migration failed: ${nullPasswordTypes[0].nullCount} accounts still have NULL passwordType`
      );
    }

    // Final verification
    const finalStats = await queryRunner.query(`
      SELECT
        "passwordType",
        COUNT(*) as count
      FROM user_usager
      GROUP BY "passwordType"
      ORDER BY "passwordType"
    `);

    console.log("📊 Final distribution:");
    finalStats.forEach((stat) => {
      console.log(`  ${stat.passwordType}: ${stat.count} accounts`);
    });

    // Rendre la colonne NOT NULL maintenant qu'elle est peuplée
    await queryRunner.query(`
      ALTER TABLE "user_usager"
      ALTER COLUMN "passwordType" SET NOT NULL
    `);

    console.log("🎉 Password type migration completed!");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_usager" DROP COLUMN "passwordType"
    `);
  }
}
