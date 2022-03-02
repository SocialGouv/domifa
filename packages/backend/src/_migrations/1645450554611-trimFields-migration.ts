import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class trimFieldsMigration1645450554611 implements MigrationInterface {
  name = "trimFieldsMigration1645450554611";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug("[MIGRATION] Trim des champs de structure");
    await queryRunner.query(`UPDATE "structure"  AS s SET nom = TRIM(s.nom)`);
    await queryRunner.query(
      `UPDATE "structure"  AS s SET adresse = TRIM(s.adresse)`
    );
    await queryRunner.query(
      `UPDATE "structure"  AS s SET "complementAdresse" = TRIM(s."complementAdresse")`
    );
    await queryRunner.query(
      `UPDATE "structure"  AS s SET agrement = TRIM(s.agrement)`
    );
    await queryRunner.query(
      `UPDATE "structure"  AS s SET email = TRIM(s.email)`
    );
    appLogger.debug("[MIGRATION] Trim des champs de usagers");

    // Users
    await queryRunner.query(
      `UPDATE "user_structure" AS us SET nom = TRIM(us.nom)`
    );
    await queryRunner.query(
      `UPDATE "user_structure" AS us SET prenom = TRIM(us.prenom)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
