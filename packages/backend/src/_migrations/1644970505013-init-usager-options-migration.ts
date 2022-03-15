import { MigrationInterface, QueryRunner } from "typeorm";

import { domifaConfig } from "../config";

export class initUsagerOptionsHistoryMigration1644970505013
  implements MigrationInterface
{
  name = "initUsagerOptionsHistoryMigration1644970505013";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `CREATE TABLE "usager_options_history" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "usagerUUID" uuid NOT NULL, "userId" integer, "userName" text NOT NULL, "structureId" integer NOT NULL, "action" text NOT NULL, "type" text NOT NULL, "nom" text, "prenom" text, "adresse" text, "actif" boolean NOT NULL DEFAULT false, "dateDebut" date, "dateFin" date, "dateNaissance" date, CONSTRAINT "PK_429ff2cc277afdc9e1ce5ac8d63" PRIMARY KEY ("uuid"))`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_3cb5af09bf7cd68d7070dbc896" ON "usager_options_history" ("usagerUUID") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_c2fa002e6f45fe1ca6c7f23496" ON "usager_options_history" ("userId") `
      );
      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "options" SET DEFAULT '{ "transfert":{ "actif":false, "nom":null, "adresse":null, "dateDebut":null, "dateFin":null }, "procurations":[], "npai":{ "actif":false, "dateDebut":null }, "portailUsagerEnabled":false }'`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_options_history" ADD CONSTRAINT "FK_3cb5af09bf7cd68d7070dbc8966" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_options_history" DROP CONSTRAINT "FK_3cb5af09bf7cd68d7070dbc8966"`
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
