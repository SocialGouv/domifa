import { MigrationInterface, QueryRunner } from "typeorm";

import { domifaConfig } from "../config";

export class autoMigration1644916369987 implements MigrationInterface {
  name = "autoMigration1644916369987";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "prod" || domifaConfig().envId === "preprod") {
      await queryRunner.query(
        `CREATE TABLE "usager_options_history" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "userId" text NOT NULL, "structureId" integer NOT NULL, "action" text NOT NULL, "type" text NOT NULL, "date" date NOT NULL, "nom" text NOT NULL, "prenom" text NOT NULL, "adresse" text NOT NULL, "actif" boolean NOT NULL DEFAULT false, "dateDebut" date, "dateFin" date, "dateNaissance" date, "usagerUUID" uuid, CONSTRAINT "PK_429ff2cc277afdc9e1ce5ac8d63" PRIMARY KEY ("uuid"))`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "usager_options_history"`);
  }
}
