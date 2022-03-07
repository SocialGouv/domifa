import { MigrationInterface, QueryRunner } from "typeorm";

import { domifaConfig } from "../config";

export class initUsagerOptionsHistoryMigration1644970505013
  implements MigrationInterface
{
  name = "initUsagerOptionsHistoryMigration1644970505013";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "prod" || domifaConfig().envId === "preprod") {
      await queryRunner.query(
        `CREATE TABLE "usager_options_history" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "usagerUUID" uuid NOT NULL, "userId" integer, "userName" text NOT NULL, "structureId" integer NOT NULL, "action" text NOT NULL, "type" text NOT NULL, "date" date NOT NULL, "nom" text NOT NULL, "prenom" text NOT NULL, "adresse" text NOT NULL, "actif" boolean NOT NULL DEFAULT false, "dateDebut" date, "dateFin" date, "dateNaissance" date, CONSTRAINT "PK_429ff2cc277afdc9e1ce5ac8d63" PRIMARY KEY ("uuid"))`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_3cb5af09bf7cd68d7070dbc896" ON "usager_options_history" ("usagerUUID") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_c2fa002e6f45fe1ca6c7f23496" ON "usager_options_history" ("userId") `
      );

      await queryRunner.query(
        `ALTER TABLE "interactions" ALTER COLUMN "dateInteraction" TYPE TIMESTAMP WITH TIME ZONE`
      );

      await queryRunner.query(
        `ALTER TABLE "interactions" ALTER COLUMN "dateInteraction" SET NOT NULL`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP CONSTRAINT "FK_495b59d0dd15e43b262f2da8907"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_options_history" DROP CONSTRAINT "FK_3cb5af09bf7cd68d7070dbc8966"`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP COLUMN "dateInteraction"`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ADD "dateInteraction" TIMESTAMP NOT NULL`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c2fa002e6f45fe1ca6c7f23496"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3cb5af09bf7cd68d7070dbc896"`
    );
    await queryRunner.query(`DROP TABLE "usager_options_history"`);
  }
}
