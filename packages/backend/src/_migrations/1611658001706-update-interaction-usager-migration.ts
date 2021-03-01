import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { appLogger } from "../util";

export class autoMigration1611658001706 implements MigrationInterface {
  name = "autoMigration1611658001706";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(
      `[Migration] UP "${this.name}" (env:${domifaConfig().envId})`
    );
    await queryRunner.query(`DROP INDEX "IDX_c7086be1b4ebe5db4b6db30cb6"`);
    await queryRunner.query(
      `ALTER TABLE "interactions" RENAME COLUMN "usagerId" TO "usagerRef"`
    );
    await queryRunner.query(`ALTER TABLE "interactions" ADD "usagerUUID" uuid`);
    await queryRunner.query(
      `CREATE INDEX "IDX_0c5d7e9585c77ff002d4072c3c" ON "interactions" ("usagerRef") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f9c3ee379ce68d4acfe4199a33" ON "interactions" ("usagerUUID") `
    );
    await queryRunner.query(
      `UPDATE interactions
      SET "usagerUUID"=u.uuid
      FROM (select uuid, ref, "structureId" from usager) AS u
      WHERE interactions."usagerRef" = u."ref" and interactions."structureId" = u."structureId";`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ALTER COLUMN "usagerUUID" set NOT null;`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ADD CONSTRAINT "FK_f9c3ee379ce68d4acfe4199a335" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP CONSTRAINT "FK_f9c3ee379ce68d4acfe4199a335"`
    );
    await queryRunner.query(`DROP INDEX "IDX_f9c3ee379ce68d4acfe4199a33"`);
    await queryRunner.query(`DROP INDEX "IDX_0c5d7e9585c77ff002d4072c3c"`);
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP COLUMN "usagerUUID"`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" RENAME COLUMN "usagerRef" TO "usagerId"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c7086be1b4ebe5db4b6db30cb6" ON "interactions" ("usagerId") `
    );
  }
}
