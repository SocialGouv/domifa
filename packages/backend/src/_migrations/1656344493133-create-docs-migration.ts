import { MigrationInterface, QueryRunner } from "typeorm";

export class createDocsMigration1656344493133 implements MigrationInterface {
  name = "createDocsMigration1656344493133";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "usager_docs" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "version" integer NOT NULL,
      "usagerUUID" uuid NOT NULL,
      "structureId" integer NOT NULL,
      "usagerRef" integer NOT NULL,
      "path" text NOT NULL,
      "label" text NOT NULL,
      "filetype" text NOT NULL,
      "createdBy" text NOT NULL,
      CONSTRAINT "PK_e7bb21f7a22254259ca123c5caa" PRIMARY KEY ("uuid"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_08c4299b8abc6b9f548f2aece2" ON "usager_docs" ("usagerUUID") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b1db67565e53acec53d5f3aa92" ON "usager_docs" ("structureId") `
    );
    await queryRunner.query(
      `ALTER TABLE "usager_docs" ADD CONSTRAINT "FK_08c4299b8abc6b9f548f2aece20" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_docs" ADD CONSTRAINT "FK_b1db67565e53acec53d5f3aa926" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_docs" DROP CONSTRAINT "FK_b1db67565e53acec53d5f3aa926"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_docs" DROP CONSTRAINT "FK_08c4299b8abc6b9f548f2aece20"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b1db67565e53acec53d5f3aa92"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_08c4299b8abc6b9f548f2aece2"`
    );
    await queryRunner.query(`DROP TABLE "usager_docs"`);
  }
}
