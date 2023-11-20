import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1699910877010 implements MigrationInterface {
  name = "AutoMigration1699910877010";
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `CREATE TABLE "user_usager_login" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "usagerUUID" uuid NOT NULL, "structureId" integer NOT NULL, CONSTRAINT "PK_cfb7dc4a81d1db054ab5b4d50bf" PRIMARY KEY ("uuid"))`
      );
      await queryRunner.query(
        `CREATE INDEX "idx_user_usager_login" ON "user_usager_login" ("structureId", "usagerUUID") `
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager_login" ADD CONSTRAINT "FK_4bf76763fec5203f945338a0377" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager_login" ADD CONSTRAINT "FK_8722e56ff917692645abcd29e7c" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_usager_login" DROP CONSTRAINT "FK_8722e56ff917692645abcd29e7c"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_login" DROP CONSTRAINT "FK_4bf76763fec5203f945338a0377"`
    );

    await queryRunner.query(`DROP INDEX "public"."idx_user_usager_login"`);
    await queryRunner.query(`DROP TABLE "user_usager_login"`);
  }
}
