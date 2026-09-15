import { MigrationInterface, QueryRunner } from "typeorm";

// usager_lien : lien "conjoint" (extensible plus tard) entre deux dossiers
// d'une même structure, stocké en "deux lignes miroir" (une ligne par
// usager). La contrainte UNIQUE sur "usagerUUID" garantit le 1-1 au niveau
// base : un usager ne peut jamais apparaître comme "usagerUUID" sur plus
// d'une ligne. Les deux lignes d'un même lien sont toujours créées /
// supprimées ensemble par UsagerLienService, dans une transaction.
//
// usager_lien_suggestion_rejetee : persiste le "Ce n'est pas la même
// personne" du formulaire de liaison, pour que la suggestion de matching
// automatique ne réapparaisse plus pour ce (dossier, ayant droit).
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
