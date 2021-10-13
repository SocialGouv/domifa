import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class CreateDatabase1634037134019 implements MigrationInterface {
  name = "CreateDatabase1634037134019";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn(`[${this.name}] MIGRATION UP...`);

    // FIX: delete duplicated interactions
    await queryRunner.query(`DELETE from interactions i1
        where exists (select 1 from interactions i2
        where i1.uuid=i2.uuid and i1.id > i2.id and i1."createdAt"=i2."createdAt");`);
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP CONSTRAINT "PK_9cf825bde3ff3a979664feb460f"`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ADD CONSTRAINT "PK_006113a10247f411c459d62a5b3" PRIMARY KEY ("uuid")`
    );
    // id has been removed some weeks ago (uuid is enough)
    await queryRunner.query(`ALTER TABLE "interactions" DROP COLUMN "id"`);
    // table "user" has been renamed to "user_structure"
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "user_structure_id_seq" OWNED BY "user_structure"."id"`
    );
    await queryRunner.query(
      `SELECT setval('user_structure_id_seq', (SELECT MAX(id) FROM "user_structure"));`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ALTER COLUMN "id" SET DEFAULT nextval('"user_structure_id_seq"')`
    );
    await queryRunner.query(`DROP SEQUENCE "app_user_id_seq"`);

    // sync typeorm (suite à changement de version?)
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP CONSTRAINT "FK_64204d3f209764ef8d08f334bd7"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP CONSTRAINT "FK_cec1c2a0820383d2a4045b5f902"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP CONSTRAINT "FK_4950bb2d2181b91b9219f9039c9"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_22a5c4a3d9b2fb8e4e73fc4ada"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3fa909d0e37c531ebc23770339"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_64204d3f209764ef8d08f334bd"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4950bb2d2181b91b9219f9039c"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cec1c2a0820383d2a4045b5f90"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e2828c51dc4d023377f256c980" ON "user_structure" ("email") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_74b1b39487db0e5d3471b370cf" ON "user_structure" ("id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a52dec7d55b4a81a0af0136148" ON "user_structure" ("structureId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0389a8aa8e69b2d17210745d04" ON "user_structure_security" ("userId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_57be1bdd772eb3fea1e201317e" ON "user_structure_security" ("structureId") `
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD CONSTRAINT "FK_a52dec7d55b4a81a0af01361485" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" ADD CONSTRAINT "FK_0389a8aa8e69b2d17210745d040" FOREIGN KEY ("userId") REFERENCES "user_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" ADD CONSTRAINT "FK_57be1bdd772eb3fea1e201317e6" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP CONSTRAINT "FK_57be1bdd772eb3fea1e201317e6"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP CONSTRAINT "FK_0389a8aa8e69b2d17210745d040"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP CONSTRAINT "FK_a52dec7d55b4a81a0af01361485"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_57be1bdd772eb3fea1e201317e"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0389a8aa8e69b2d17210745d04"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a52dec7d55b4a81a0af0136148"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_74b1b39487db0e5d3471b370cf"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e2828c51dc4d023377f256c980"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cec1c2a0820383d2a4045b5f90" ON "user_structure_security" ("userId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4950bb2d2181b91b9219f9039c" ON "user_structure_security" ("structureId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_64204d3f209764ef8d08f334bd" ON "user_structure" ("structureId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3fa909d0e37c531ebc23770339" ON "user_structure" ("email") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_22a5c4a3d9b2fb8e4e73fc4ada" ON "user_structure" ("id") `
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" ADD CONSTRAINT "FK_4950bb2d2181b91b9219f9039c9" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" ADD CONSTRAINT "FK_cec1c2a0820383d2a4045b5f902" FOREIGN KEY ("userId") REFERENCES "user_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD CONSTRAINT "FK_64204d3f209764ef8d08f334bd7" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
