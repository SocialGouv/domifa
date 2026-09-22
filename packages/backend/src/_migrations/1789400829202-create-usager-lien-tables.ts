import { MigrationInterface, QueryRunner } from "typeorm";

// usager_lien: "conjoint" link (extensible later on) between two dossiers
// of the same structure, stored as "mirrored rows" (one row per usager).
// The UNIQUE constraint on "usagerUUID" enforces the 1-1 rule at the DB
// level: a usager can never appear as "usagerUUID" on more than one row.
// The two rows of a given link are always created / deleted together by
// UsagerLienService, within a transaction.
//
// usager_lien_suggestion_rejetee: persists the "This isn't the same
// person" dismissal from the linking form, so the automatic matching
// suggestion doesn't reappear for that (dossier, ayant droit) pair.
export class CreateUsagerLienTables1789400829202 implements MigrationInterface {
  name = "CreateUsagerLienTables1789400829202";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "usager_lien" (
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
        "version" integer NOT NULL,
        "usagerUUID" uuid NOT NULL,
        "linkedUsagerUUID" uuid NOT NULL,
        "type" text NOT NULL DEFAULT 'CONJOINT',
        "structureId" integer NOT NULL,
        "createdBy" jsonb,
        CONSTRAINT "PK_usager_lien" PRIMARY KEY ("uuid"),
        CONSTRAINT "UQ_usager_lien_usagerUUID" UNIQUE ("usagerUUID"),
        CONSTRAINT "CHK_usager_lien_not_self" CHECK ("usagerUUID" <> "linkedUsagerUUID"),
        CONSTRAINT "FK_usager_lien_usager" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE,
        CONSTRAINT "FK_usager_lien_linked_usager" FOREIGN KEY ("linkedUsagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE,
        CONSTRAINT "FK_usager_lien_structure" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_usager_lien_linkedUsagerUUID" ON "usager_lien" ("linkedUsagerUUID")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_usager_lien_structureId" ON "usager_lien" ("structureId")`
    );

    await queryRunner.query(`
      CREATE TABLE "usager_lien_suggestion_rejetee" (
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
        "version" integer NOT NULL,
        "usagerUUID" uuid NOT NULL,
        "ayantDroitUUID" uuid NOT NULL,
        "structureId" integer NOT NULL,
        "createdBy" jsonb,
        CONSTRAINT "PK_usager_lien_suggestion_rejetee" PRIMARY KEY ("uuid"),
        CONSTRAINT "UQ_usager_lien_suggestion_rejetee" UNIQUE ("usagerUUID", "ayantDroitUUID"),
        CONSTRAINT "FK_usager_lien_suggestion_rejetee_usager" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE,
        CONSTRAINT "FK_usager_lien_suggestion_rejetee_structure" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_usager_lien_suggestion_rejetee_structureId" ON "usager_lien_suggestion_rejetee" ("structureId")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "usager_lien_suggestion_rejetee"`
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "usager_lien"`);
  }
}
