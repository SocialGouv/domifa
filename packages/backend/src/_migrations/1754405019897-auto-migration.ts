import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1754405019897 implements MigrationInterface {
  name = "AutoMigration1754405019897";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "dev" ||
      domifaConfig().envId === "local"
    ) {
      // User Structure
      await queryRunner.query(
        `ALTER TABLE "user_structure_security" ADD "structureId" integer`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure_security" ADD CONSTRAINT "FK_57be1bdd772eb3fea1e201317e6" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_57be1bdd772eb3fea1e201317e" ON "user_structure_security" ("structureId") `
      );
      // ---

      // User Usager
      await queryRunner.query(
        `ALTER TABLE "user_usager_security" ADD "temporaryTokens" jsonb`
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager_security" DROP CONSTRAINT "FK_0b7885e1594c7af3a5b84a4bdb3"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager_security" DROP CONSTRAINT "UQ_0b7885e1594c7af3a5b84a4bdb3"`
      );

      await queryRunner.query(
        `ALTER TABLE "user_usager_security" ADD CONSTRAINT "FK_0b7885e1594c7af3a5b84a4bdb3" FOREIGN KEY ("userId") REFERENCES "user_usager"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager_security" ADD CONSTRAINT "UQ_a21e4892613030aa47755b46a75" UNIQUE ("userId", "structureId")`
      );
      // ------

      // User Supervisor
      await queryRunner.query(
        `ALTER TABLE "user_supervisor_security" DROP CONSTRAINT "FK_94c17da6c8fc82ac679eefd3ecb"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_supervisor_security" ADD CONSTRAINT "UQ_94c17da6c8fc82ac679eefd3ecb" UNIQUE ("userId")`
      );
      await queryRunner.query(
        `ALTER TABLE "user_supervisor_security" ADD CONSTRAINT "FK_94c17da6c8fc82ac679eefd3ecb" FOREIGN KEY ("userId") REFERENCES "user_supervisor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" DROP CONSTRAINT "FK_0b7885e1594c7af3a5b84a4bdb3"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP CONSTRAINT "FK_57be1bdd772eb3fea1e201317e6"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_supervisor_security" DROP CONSTRAINT "FK_94c17da6c8fc82ac679eefd3ecb"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" DROP CONSTRAINT "UQ_a21e4892613030aa47755b46a75"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_57be1bdd772eb3fea1e201317e"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b2ad525cbadf911e833bf61597"`
    );

    await queryRunner.query(
      `ALTER TABLE "user_usager_security" ADD CONSTRAINT "UQ_0b7885e1594c7af3a5b84a4bdb3" UNIQUE ("userId")`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" ADD CONSTRAINT "FK_0b7885e1594c7af3a5b84a4bdb3" FOREIGN KEY ("userId") REFERENCES "user_usager"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "user_supervisor_security" DROP CONSTRAINT "UQ_94c17da6c8fc82ac679eefd3ecb"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_supervisor_security" ADD CONSTRAINT "FK_94c17da6c8fc82ac679eefd3ecb" FOREIGN KEY ("userId") REFERENCES "user_supervisor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" DROP COLUMN "temporaryTokens"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP COLUMN "structureId"`
    );
  }
}
