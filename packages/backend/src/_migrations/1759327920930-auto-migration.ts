import { MigrationInterface, QueryRunner } from "typeorm";

import { v4 as uuidv4 } from "uuid";
import { StructureDecisionStatut } from "@domifa/common";

export class AutoMigration1759327920930 implements MigrationInterface {
  name = "AutoMigration1759327920930";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" ADD "statut" text NOT NULL DEFAULT 'EN_ATTENTE'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ADD "decision" jsonb NOT NULL DEFAULT '{}'::jsonb`
    );

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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP COLUMN "fonctionDetail"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD "fonctionDetail" character varying(255)`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" DROP COLUMN "statutDetail"`
    );
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "statut"`);
    await queryRunner.query(
      `ALTER TABLE "structure" ADD "verified" boolean NOT NULL DEFAULT false`
    );
  }
}
