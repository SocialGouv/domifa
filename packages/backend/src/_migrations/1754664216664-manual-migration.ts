import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class ManualMigration1754664216664 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "dev" ||
      domifaConfig().envId === "local"
    ) {
      // Update user_structure_security table with structureId from user_structure
      await queryRunner.query(`
                UPDATE user_structure_security
                SET "structureId" = (
                    SELECT us."structureId"
                    FROM user_structure us
                    WHERE us.id = user_structure_security."userId"
                )
                WHERE "structureId" IS NULL
            `);

      // Update user_usager_security table with structureId from user_usager
      await queryRunner.query(`
                UPDATE user_usager_security
                SET "structureId" = (
                    SELECT uu."structureId"
                    FROM user_usager uu
                    WHERE uu.id = user_usager_security."userId"
                )
                WHERE "structureId" IS NULL
            `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Set structureId values back to NULL
    await queryRunner.query(`
            UPDATE user_structure_security
            SET "structureId" = NULL
        `);

    await queryRunner.query(`
            UPDATE user_usager_security
            SET "structureId" = NULL
        `);
  }
}
