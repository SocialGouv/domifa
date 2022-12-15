import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class createEntretienMigration1671061062285
  implements MigrationInterface
{
  name = "createEntretienMigration1671061062285";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "dev" || domifaConfig().envId === "test") {
      return;
    }

    console.log("[MIGRATION] Renommage de l'entretien");
    await queryRunner.query(
      `ALTER TABLE "usager" RENAME COLUMN "entretien" TO "oldEntretien"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "oldEntretien" DROP NOT NULL`
    );

    await queryRunner.query(
      `CREATE TABLE "usager_entretien" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL,  "usagerUUID" uuid NOT NULL, "structureId" integer NOT NULL, "usagerRef" integer NOT NULL, "domiciliation" boolean, "commentaires" text, "typeMenage" text, "revenus" boolean, "revenusDetail" text, "orientation" boolean, "orientationDetail" text, "liencommune" text, "liencommuneDetail" text, "residence" text, "residenceDetail" text, "cause" text, "causeDetail" text, "rattachement" text, "raison" text, "raisonDetail" text, "accompagnement" boolean, "accompagnementDetail" text, CONSTRAINT "PK_1da0e283293a4bb213ffd0ef280" PRIMARY KEY ("uuid"))`
    );

    console.log("[MIGRATION] Create indexes pour les entretien");
    await queryRunner.query(
      `CREATE INDEX "IDX_aa19c17fc79f4e4a648643096f" ON "usager_entretien" ("usagerUUID") `
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_6193a732dd00abc56e91e92fe4" ON "usager_entretien" ("structureId") `
    );

    await queryRunner.query(
      `ALTER TABLE "usager_entretien" ADD CONSTRAINT "FK_aa19c17fc79f4e4a648643096f9" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "usager_entretien" ADD CONSTRAINT "FK_6193a732dd00abc56e91e92fe48" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    console.log("[MIGRATION] Mise à jour de la variable de migration");
    await queryRunner.query(`UPDATE "usager" set migrated = false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_entretien" DROP CONSTRAINT "FK_6193a732dd00abc56e91e92fe48"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_entretien" DROP CONSTRAINT "FK_aa19c17fc79f4e4a648643096f9"`
    );

    await queryRunner.query(
      `DROP INDEX "public"."IDX_6193a732dd00abc56e91e92fe4"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_aa19c17fc79f4e4a648643096f"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_819bceac1e832878bf38844f9b"`
    );
    await queryRunner.query(`DROP TABLE "usager_entretien"`);
    await queryRunner.query(
      `ALTER TABLE "usager" RENAME COLUMN "oldEntretien" TO "entretien"`
    );
  }
}
