import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1755523274895 implements MigrationInterface {
  name = "AutoMigration1755523274895";

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log("🚀 Starting password type migration");

    const cutoffDate = "2024-08-15";

    // Initial stats
    const initialStats = await queryRunner.query(
      `
            SELECT
                COUNT(*) as totalAccounts,
                COUNT(*) FILTER (WHERE "createdAt" >= $1) as createdAfterCutoff,
                COUNT(*) FILTER (WHERE "createdAt" < $1) as createdBeforeCutoff,
                COUNT(*) FILTER (WHERE "isTemporaryPassword" = true) as temporaryPasswords,
                COUNT(*) FILTER (WHERE "isTemporaryPassword" = false) as personalPasswords
            FROM user_usager
        `,
      [cutoffDate]
    );

    console.log(`📊 Initial stats:`, initialStats[0]);

    // Update RANDOM (isTemporaryPassword = true AND created after cutoff)
    const randomUpdates = await queryRunner.query(
      `
            UPDATE user_usager
            SET "passwordType" = 'RANDOM'
            WHERE "isTemporaryPassword" = true
            AND "createdAt" < $1
        `,
      [cutoffDate]
    );

    console.log(
      `✅ Set ${randomUpdates.affectedRows || 0} accounts to RANDOM type`
    );

    // Update BIRTH_DATE (isTemporaryPassword = true AND created before cutoff)
    const birthDateUpdates = await queryRunner.query(
      `
            UPDATE user_usager
            SET "passwordType" = 'BIRTH_DATE'
            WHERE "isTemporaryPassword" = true
            AND "createdAt" >= $1
        `,
      [cutoffDate]
    );

    console.log(
      `✅ Set ${birthDateUpdates.affectedRows || 0} accounts to BIRTH_DATE type`
    );

    // Update PERSONAL (isTemporaryPassword = false)
    const personalUpdates = await queryRunner.query(`
            UPDATE user_usager
            SET "passwordType" = 'PERSONAL'
            WHERE "isTemporaryPassword" = false
        `);

    console.log(
      `✅ Set ${personalUpdates.affectedRows || 0} accounts to PERSONAL type`
    );

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
      console.log(`  ${stat.passwordType || "NULL"}: ${stat.count} accounts`);
    });

    console.log("🎉 Password type migration completed!");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_usager" DROP COLUMN "passwordType"`
    );
  }
}
