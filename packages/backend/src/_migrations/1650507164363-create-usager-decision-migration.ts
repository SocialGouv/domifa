import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { appLogger } from "../util";

export class createUsagerDecisionMigration1650507164363
  implements MigrationInterface
{
  name = "createUsagerDecisionMigration1650507164363";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      appLogger.warn("[MIGRATION] Création de la table des décision");
      await queryRunner.query(
        `CREATE TABLE "usager_decision" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "usagerUUID" uuid NOT NULL, "usagerRef" integer NOT NULL, "structureId" integer NOT NULL, "dateDecision" date NOT NULL, "dateDebut" date, "dateFin" date, "typeDom" text, "statut" text, "motif" text, "motifDetails" text, "orientation" text, "orientationDetails" text, "userId" integer NOT NULL, "userName" text NOT NULL, CONSTRAINT "UQ_ff1ee502905c86b80935aef7f9c" UNIQUE ("structureId", "usagerRef"), CONSTRAINT "PK_30d888b1b67f17d4fcd1d72d390" PRIMARY KEY ("uuid"))`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_3806a2ceeec1abe6cce660a9ac" ON "usager_decision" ("usagerUUID") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_b023b08dfa342b77e9f164381d" ON "usager_decision" ("structureId") `
      );

      await queryRunner.query(
        `ALTER TABLE "usager_decision" ADD CONSTRAINT "FK_3806a2ceeec1abe6cce660a9ac3" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_decision" DROP CONSTRAINT "FK_3806a2ceeec1abe6cce660a9ac3"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b023b08dfa342b77e9f164381d"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3806a2ceeec1abe6cce660a9ac"`
    );
    await queryRunner.query(`DROP TABLE "usager_decision"`);
  }
}
