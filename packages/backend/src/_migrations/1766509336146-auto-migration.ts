import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class ManualMigration1766509336146 implements MigrationInterface {
  name = "ManualMigration1766509336146";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async down(_queryRunner: QueryRunner): Promise<void> {}
  async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "local" ||
      domifaConfig().envId === "preprod"
    ) {
      console.log(
        "\n=== Migration: Consolidate typeDom across usager and decision ===\n"
      );

      // Pre-migration checks
      console.log("📊 Before migration stats:");

      const usagersNullTypeDom = await queryRunner.query(`
    SELECT COUNT(*) as count
    FROM usager
    WHERE "typeDom" IS NULL
  `);
      console.table(usagersNullTypeDom);

      const decisionsMissingTypeDom = await queryRunner.query(`
    SELECT COUNT(*) as count
    FROM usager
    WHERE decision IS NOT NULL
      AND decision->>'typeDom' IS NULL
  `);
      console.table(decisionsMissingTypeDom);

      const historyStatesNullTypeDom = await queryRunner.query(`
    SELECT COUNT(*) as count
    FROM usager_history_states
    WHERE "typeDom" IS NULL
  `);
      console.table(historyStatesNullTypeDom);

      // Step 1: Add typeDom to decision JSONB if it exists in usager
      console.log(
        "\n✏️  Step 1: Adding typeDom to decision from usager.typeDom..."
      );
      const result1 = await queryRunner.query(`
    UPDATE usager
    SET decision = jsonb_set(
      decision,
      '{typeDom}',
      to_jsonb(u."typeDom")
    )
    FROM (
      SELECT uuid, "typeDom" FROM usager WHERE "typeDom" IS NOT NULL
    ) u
    WHERE usager.uuid = u.uuid
      AND usager.decision IS NOT NULL
      AND usager.decision->>'typeDom' IS NULL
  `);
      console.log(`✓ Updated ${result1[1]} records\n`);

      // Step 2: If usager.typeDom is null, try to get it from decision.typeDom
      console.log(
        "✏️  Step 2: Filling usager.typeDom from decision.typeDom..."
      );
      const result2 = await queryRunner.query(`
           UPDATE usager
           SET "typeDom" = (decision->>'typeDom')::text
           WHERE "typeDom" IS NULL
            AND decision IS NOT NULL
            AND decision->>'typeDom' IS NOT NULL
            AND decision->>'typeDom' IN ('PREMIERE_DOM', 'RENOUVELLEMENT')

  `);
      console.log(`✓ Updated ${result2[1]} records\n`);

      // Step 3: For remaining nulls, check historique for the most recent valid typeDom
      console.log("✏️  Step 3: Searching historique for typeDom...");
      const result3 = await queryRunner.query(`
    UPDATE usager
    SET "typeDom" = (
      SELECT decision->>'typeDom'
      FROM (
        SELECT jsonb_array_elements(historique) as decision
        FROM usager u2
        WHERE u2.uuid = usager.uuid
          AND historique IS NOT NULL
      ) hist
      WHERE (hist.decision->>'typeDom') IS NOT NULL
      LIMIT 1
    )
    WHERE "typeDom" IS NULL
      AND historique IS NOT NULL
  `);
      console.log(`✓ Updated ${result3[1]} records\n`);

      // Step 4: Default to PREMIERE_DOM for any remaining nulls
      console.log("✏️  Step 4: Setting remaining nulls to PREMIERE_DOM...");
      const result4 = await queryRunner.query(`
    UPDATE usager
    SET "typeDom" = 'PREMIERE_DOM'
    WHERE "typeDom" IS NULL
  `);
      console.log(`✓ Updated ${result4[1]} records\n`);

      // Step 5: Update usager_history_states to match usager.typeDom
      console.log("✏️  Step 5: Syncing usager_history_states.typeDom...");
      const result5 = await queryRunner.query(`
    UPDATE usager_history_states
    SET "typeDom" = u."typeDom"
    FROM usager u
    WHERE usager_history_states."usagerUUID" = u."uuid"
      AND usager_history_states."typeDom" IS NULL
  `);
      console.log(`✓ Updated ${result5[1]} records\n`);

      // Step 6: Default any remaining null typeDom in history states
      console.log(
        "✏️  Step 6: Setting remaining history states nulls to PREMIERE_DOM..."
      );
      const result6 = await queryRunner.query(`
    UPDATE usager_history_states
    SET "typeDom" = 'PREMIERE_DOM'
    WHERE "typeDom" IS NULL
  `);
      console.log(`✓ Updated ${result6[1]} records\n`);

      // Step 7: Add typeDom to decision JSONB in usager_history_states
      console.log(
        "✏️  Step 7: Adding typeDom to decision in usager_history_states..."
      );
      const result7 = await queryRunner.query(`
    UPDATE usager_history_states
    SET decision = jsonb_set(
      decision,
      '{typeDom}',
      to_jsonb("typeDom")
    )
    WHERE decision IS NOT NULL
      AND decision->>'typeDom' IS NULL
  `);
      console.log(`✓ Updated ${result7[1]} records\n`);

      // Post-migration verification
      console.log("📊 After migration stats:");

      const usagersStillNull = await queryRunner.query(`
    SELECT COUNT(*)::integer as count
    FROM usager
    WHERE "typeDom" IS NULL
  `);
      console.table(usagersStillNull);

      const decisionsStillMissing = await queryRunner.query(`
    SELECT COUNT(*)::integer as count
    FROM usager
    WHERE decision IS NOT NULL
      AND decision->>'typeDom' IS NULL
  `);
      console.table(decisionsStillMissing);

      const historyStatesStillNull = await queryRunner.query(`
    SELECT COUNT(*)::integer as count
    FROM usager_history_states
    WHERE "typeDom" IS NULL
  `);
      console.table(historyStatesStillNull);

      console.log("\n✅ Migration completed successfully!\n");
    }
  }
}
