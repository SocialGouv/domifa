import { MigrationInterface, QueryRunner } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { StructureDecisionStatut } from "@domifa/common";
import { domifaConfig } from "../config";

export class AutoMigration1762382467280 implements MigrationInterface {
  name = "AutoMigration1762382467280";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      const structures = await queryRunner.query(
        `SELECT id, verified, "createdAt" FROM "structure"`
      );

      for (const structure of structures) {
        const statut: StructureDecisionStatut = structure?.verified
          ? "VALIDE"
          : "EN_ATTENTE";

        const decision = {
          uuid: uuidv4(),
          dateDecision: structure.createdAt,
          statut: statut,
          motif: null,
          motifDetails: null,
          userId: 1,
          userName: "Migration DomiFa",
        };

        await queryRunner.query(
          `UPDATE "structure"
         SET "statut" = $1,
             "decision" = $2::jsonb
         WHERE id = $3`,
          [statut, JSON.stringify(decision), structure.id]
        );
      }

      await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "verified"`);
    }
  }

  public async down(): Promise<void> {}
}
