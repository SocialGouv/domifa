import { MigrationInterface, QueryRunner } from "typeorm";
import { userUsagerCreator } from "../modules/portail-usagers/services";

export class AutoMigration1755523274896 implements MigrationInterface {
  name = "AutoMigration1755523274896";
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log("🚀 Starting user_usager and portailEnabled cleanup");

    console.log(
      "📊 accountExistingButDisabled: Initial stats for existing user_usager accounts with disabled portal"
    );

    const accountExistingButDisabledInitialStats = await queryRunner.query(`
            SELECT COUNT(*) as countUsersWithDisabledPortal
            FROM user_usager uu
            INNER JOIN usager u ON uu."usagerUUID" = u.uuid
            WHERE (u.options ->> 'portailUsagerEnabled')::boolean != true
               OR u.options ->> 'portailUsagerEnabled' IS NULL
        `);

    console.log(
      `📈 accountExistingButDisabled initial: ${accountExistingButDisabledInitialStats[0].countUsersWithDisabledPortal} user_usager accounts with disabled portal`
    );

    console.log(
      "🔧 accountExistingButDisabled: Processing - Enabling portal for existing accounts"
    );

    const accountExistingButDisabledUsers = await queryRunner.query(`
            SELECT DISTINCT
                u.uuid,
                u.nom,
                u.prenom,
                u.email,
                u."structureId",
                u.options ->> 'portailUsagerEnabled' as currentPortalStatus
            FROM user_usager uu
            INNER JOIN usager u ON uu."usagerUUID" = u.uuid
            WHERE (u.options ->> 'portailUsagerEnabled')::boolean != true
               OR u.options ->> 'portailUsagerEnabled' IS NULL
            ORDER BY u.nom, u.prenom
        `);

    let accountExistingButDisabledUpdatedCount = 0;
    for (const user of accountExistingButDisabledUsers) {
      try {
        await queryRunner.query(
          `
                    UPDATE usager
                    SET options = COALESCE(options, '{}')::jsonb || '{"portailUsagerEnabled": "true"}'::jsonb
                    WHERE uuid = $1
                `,
          [user.uuid]
        );

        console.log(
          `✅ accountExistingButDisabled: Portal enabled for ${user.nom} ${user.prenom} (${user.email})`
        );
        accountExistingButDisabledUpdatedCount++;
      } catch (error) {
        console.error(
          `❌ accountExistingButDisabled: Error for ${user.nom} ${user.prenom}:`,
          error.message
        );
      }
    }

    console.log(
      `✅ accountExistingButDisabled completed: ${accountExistingButDisabledUpdatedCount}/${accountExistingButDisabledUsers.length} portals enabled`
    );

    console.log(
      "📊 enabledWithoutAccount: Initial stats for enabled portal without user_usager account"
    );

    const enabledWithoutAccountInitialStats = await queryRunner.query(`
            SELECT COUNT(*) as countPortalEnabledWithoutAccount
            FROM usager u
            LEFT JOIN user_usager uu ON u.uuid = uu."usagerUUID"
            WHERE (u.options ->> 'portailUsagerEnabled')::boolean = true
              AND uu."usagerUUID" IS NULL
        `);

    console.log(
      `📈 enabledWithoutAccount initial: ${enabledWithoutAccountInitialStats[0].countPortalEnabledWithoutAccount} users with enabled portal but no account`
    );

    console.log(
      "🔧 enabledWithoutAccount: Processing - Creating missing user_usager accounts"
    );

    const enabledWithoutAccountUsers = await queryRunner.query(`
            SELECT
                u.uuid,
                u.nom,
                u.prenom,
                u.email,
                u."structureId",
                u.options ->> 'portailUsagerEnabled' as portalStatus
            FROM usager u
            LEFT JOIN user_usager uu ON u.uuid = uu."usagerUUID"
            WHERE (u.options ->> 'portailUsagerEnabled')::boolean = true
              AND uu."usagerUUID" IS NULL
            ORDER BY u.nom, u.prenom
        `);

    let enabledWithoutAccountCreatedCount = 0;
    let enabledWithoutAccountErrorCount = 0;

    for (const user of enabledWithoutAccountUsers) {
      try {
        if (!user.email) {
          console.warn(
            `⚠️  enabledWithoutAccount: ${user.nom} ${user.prenom} (UUID: ${user.uuid}) has no email - SKIPPED`
          );
          continue;
        }

        console.log(
          `🔄 enabledWithoutAccount: Creating account for ${user.nom} ${user.prenom} (${user.email})...`
        );

        await userUsagerCreator.createUserWithTmpPassword(
          {
            uuid: user.uuid,
            structureId: user.structureId,
            dateNaissance: user.dateNaissance,
          },
          { id: 1, nom: "Migration", prenom: "Migration" }
        );

        console.log(
          `✅ enabledWithoutAccount: Account created for ${user.nom} ${user.prenom} (${user.email})`
        );
        enabledWithoutAccountCreatedCount++;
      } catch (error) {
        console.error(
          `❌ enabledWithoutAccount: Error creating account for ${user.nom} ${user.prenom} (${user.email}):`,
          error.message
        );
        enabledWithoutAccountErrorCount++;
      }
    }

    console.log(
      `✅ enabledWithoutAccount completed: ${enabledWithoutAccountCreatedCount}/${enabledWithoutAccountUsers.length} accounts created (${enabledWithoutAccountErrorCount} errors)`
    );

    // POST-MIGRATION STATS
    console.log("📊 POST-MIGRATION GENERAL STATS");

    const postMigrationStats = await queryRunner.query(`
            SELECT
                COUNT(*) as totalUsagers,
                COUNT(*) FILTER (WHERE (options ->> 'portailUsagerEnabled')::boolean = true) as portalEnabledCount,
                COUNT(*) FILTER (WHERE (options ->> 'portailUsagerEnabled')::boolean != true OR options ->> 'portailUsagerEnabled' IS NULL) as portalDisabledCount,
                (SELECT COUNT(*) FROM user_usager) as totalUserUsagerAccounts
            FROM usager
        `);

    const accountExistingButDisabledPostStats = await queryRunner.query(`
            SELECT COUNT(*) as remainingAccountExistingButDisabled
            FROM user_usager uu
            INNER JOIN usager u ON uu."usagerUUID" = u.uuid
            WHERE (u.options ->> 'portailUsagerEnabled')::boolean != true
               OR u.options ->> 'portailUsagerEnabled' IS NULL
        `);

    const enabledWithoutAccountPostStats = await queryRunner.query(`
            SELECT COUNT(*) as remainingEnabledWithoutAccount
            FROM usager u
            LEFT JOIN user_usager uu ON u.uuid = uu."usagerUUID"
            WHERE (u.options ->> 'portailUsagerEnabled')::boolean = true
              AND uu."usagerUUID" IS NULL
        `);

    const coherentAccountsCount = await queryRunner.query(`
            SELECT COUNT(*) as coherentAccounts
            FROM user_usager uu
            INNER JOIN usager u ON uu."usagerUUID" = u.uuid
            WHERE (u.options ->> 'portailUsagerEnabled')::boolean = true
        `);

    console.log("\n📊 FINAL REPORT:");
    console.log("================");
    console.log(`📈 Post-migration stats:`, postMigrationStats[0]);
    console.log(
      `🔧 accountExistingButDisabled processed: ${accountExistingButDisabledUpdatedCount} portals enabled`
    );
    console.log(
      `🔧 enabledWithoutAccount processed: ${enabledWithoutAccountCreatedCount} accounts created`
    );
    console.log(
      `⚠️  accountExistingButDisabled remaining: ${accountExistingButDisabledPostStats[0].remainingAccountExistingButDisabled}`
    );
    console.log(
      `⚠️  enabledWithoutAccount remaining: ${enabledWithoutAccountPostStats[0].remainingEnabledWithoutAccount}`
    );
    console.log(
      `✅ Coherent accounts: ${coherentAccountsCount[0].coherentAccounts}`
    );

    // Final coherence check
    const totalUserUsagerAccounts =
      postMigrationStats[0].totalUserUsagerAccounts;
    const coherentCount = coherentAccountsCount[0].coherentAccounts;

    if (totalUserUsagerAccounts === coherentCount) {
      console.log(
        "🎉 TOTAL SUCCESS: All user_usager accounts have portailEnabled=true"
      );
    } else {
      console.log(
        `⚠️  WARNING: ${
          totalUserUsagerAccounts - coherentCount
        } user_usager accounts don't have portailEnabled=true`
      );
    }

    if (
      enabledWithoutAccountPostStats[0].remainingEnabledWithoutAccount === 0
    ) {
      console.log(
        "🎉 TOTAL SUCCESS: All users with portailEnabled=true have an account"
      );
    } else {
      console.log(
        `⚠️  WARNING: ${enabledWithoutAccountPostStats[0].remainingEnabledWithoutAccount} users with portailEnabled=true don't have an account`
      );
    }

    console.log("\n🎯 CONCLUSION:");
    if (
      accountExistingButDisabledPostStats[0]
        .remainingAccountExistingButDisabled === 0 &&
      enabledWithoutAccountPostStats[0].remainingEnabledWithoutAccount === 0
    ) {
      console.log(
        "✅ PERFECT: You can now use a single countUsagersByStatus() function!"
      );
    } else {
      console.log("⚠️  Inconsistencies remain. Check the logs above.");
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log("⚠️  Reverting password type categorization...");

    // Remove the passwordType column
    await queryRunner.query(`
            ALTER TABLE user_usager
            DROP COLUMN IF EXISTS "passwordType"
        `);

    console.log("✅ passwordType column removed");
  }
}
