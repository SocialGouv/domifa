import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1696369714284 implements MigrationInterface {
  name = "AutoMigration1696369714284";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION Postgis;`);
    await queryRunner.query(
      `CREATE TABLE "open_data_places" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "nom" text NOT NULL, "adresse" text NOT NULL, "complementAdresse" text, "ville" text, "codePostal" text, "departement" text NOT NULL, "region" text NOT NULL, "latitude" numeric(10,7) NOT NULL, "longitude" numeric(10,7) NOT NULL, "source" text NOT NULL, "uniqueId" text NOT NULL, "software" text, "structureId" integer, CONSTRAINT "PK_f80b64cfb42753deacd8bf6d78d" PRIMARY KEY ("uuid"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d85d3252e11effca2f6b652fde" ON "open_data_places" ("codePostal") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0408f9f2c0defbdc5e44f467a3" ON "open_data_places" ("departement") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6e030c1cdb3fa54d0d735cdc6b" ON "open_data_places" ("region") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d10ac71fca9180b787ef468659" ON "open_data_places" ("structureId") `
    );
    await queryRunner.query(
      `ALTER TABLE "open_data_places" ADD CONSTRAINT "FK_d10ac71fca9180b787ef468659e" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "open_data_places" DROP CONSTRAINT "FK_d10ac71fca9180b787ef468659e"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d10ac71fca9180b787ef468659"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6e030c1cdb3fa54d0d735cdc6b"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0408f9f2c0defbdc5e44f467a3"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d85d3252e11effca2f6b652fde"`
    );
    await queryRunner.query(`DROP TABLE "open_data_places"`);
  }
}
