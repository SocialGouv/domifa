import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class ManualMigration1765209812052 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "prod" || domifaConfig().envId === "preprod") {
      // AVANT
      const before = await queryRunner.query(`
      SELECT
        s.id,
        s."lastLogin" as struct_login,
        MAX(us."lastLogin") as max_user_login
      FROM structure s
      LEFT JOIN user_structure us ON s.id = us."structureId"
      GROUP BY s.id, s."lastLogin"
      HAVING COUNT(us.id) > 0
    `);

      const beforeStats = {
        total: before.length,
        ok: before.filter((s) => s.ok).length,
        struct_null: before.filter((s) => s.struct_null).length,
        user_null: before.filter((s) => s.user_null).length,
        decalage: before.filter((s) => s.decalage).length,
      };

      console.log("\n📊 AVANT:\n");
      console.table(beforeStats);

      // CORRECTION
      await queryRunner.query(`
      UPDATE user_structure SET "lastLogin" = NULL
      WHERE "lastLogin" IS NOT NULL AND "lastLogin" < "createdAt"
    `);

      await queryRunner.query(`
      UPDATE structure SET "lastLogin" = NULL
      WHERE "lastLogin" IS NOT NULL AND "lastLogin" < "createdAt"
    `);

      const structures = await queryRunner.query(`
      SELECT s.id FROM structure s
      WHERE EXISTS (SELECT 1 FROM user_structure us WHERE us."structureId" = s.id)
    `);

      for (const struct of structures) {
        const result = await queryRunner.query(
          `SELECT MAX("lastLogin") as max FROM user_structure WHERE "structureId" = $1`,
          [struct.id]
        );
        await queryRunner.query(
          `UPDATE structure SET "lastLogin" = $1 WHERE id = $2`,
          [result[0]?.max || null, struct.id]
        );
      }

      // APRÈS
      // APRÈS
      const after = await queryRunner.query(`
      SELECT
        s.id,
        s."lastLogin" as struct_login,
        MAX(us."lastLogin") as max_user_login
      FROM structure s
      LEFT JOIN user_structure us ON s.id = us."structureId"
      GROUP BY s.id, s."lastLogin"
      HAVING COUNT(us.id) > 0
    `);

      const afterStats = {
        total: after.length,
        ok: after.filter(
          (s) => s.struct_login === null && s.max_user_login === null
        ).length,
        struct_null: after.filter(
          (s) => s.struct_login === null && s.max_user_login !== null
        ).length,
        user_null: after.filter(
          (s) => s.struct_login !== null && s.max_user_login === null
        ).length,
        decalage: after.filter((s) => {
          if (!s.struct_login || !s.max_user_login) return false;
          const diff = Math.abs(
            (new Date(s.struct_login).getTime() -
              new Date(s.max_user_login).getTime()) /
              86400000
          );
          return diff > 1;
        }).length,
      };
      console.log("\n📊 APRÈS:\n");
      console.table(afterStats);
    }
  }

  public async down(): Promise<void> {}
}
