import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class autoMigration1670935375216 implements MigrationInterface {
  name = "autoMigration1670935375216";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "dev" || domifaConfig().envId === "test") {
      return;
    }

    console.log("[MIGRATION] Create notes table");
    await queryRunner.query(
      `CREATE TABLE "usager_notes" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "usagerUUID" uuid NOT NULL, "structureId" integer NOT NULL, "usagerRef" integer NOT NULL, "message" text NOT NULL, "archived" boolean NOT NULL DEFAULT false,  "createdBy" jsonb, "archivedBy" jsonb, "archivedAt" date, CONSTRAINT "UQ_5d06e43196df8e4b02ceb16bc9a" UNIQUE ("id"), CONSTRAINT "PK_11acb926f75642e9dcdd97e5be1" PRIMARY KEY ("uuid"))`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_5d06e43196df8e4b02ceb16bc9" ON "usager_notes" ("id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6ca23b363643ae281d2f1eddf2" ON "usager_notes" ("usagerUUID") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e8b75cd4ebe81d288a6ff7d411" ON "usager_notes" ("structureId") `
    );

    console.log("[MIGRATION] Rename old notes table");
    await queryRunner.query(
      `ALTER TABLE usager RENAME COLUMN notes TO "oldNotes"`
    );

    console.log("[MIGRATION] Remove unused data in interactions");
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP COLUMN "interactionOutUUIDTest"`
    );

    console.log("[MIGRATION] Set default values for jsonb objects");

    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "options" SET DEFAULT '{"numeroBoite": false}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"countryCode": "fr", "numero": ""}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "telephone" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "telephone" SET DEFAULT '{"countryCode": "fr", "numero": ""}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "options" SET DEFAULT '{ "transfert":{ "actif":false, "nom":null, "adresse":null, "dateDebut":null, "dateFin":null }, "procurations":[], "npai":{ "actif":false, "dateDebut":null }, "portailUsagerEnabled":false }'`
    );

    console.log("[MIGRATION] Update indexes and constraints");
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP CONSTRAINT "FK_0389a8aa8e69b2d17210745d040"`
    );

    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP CONSTRAINT "UQ_cec1c2a0820383d2a4045b5f902"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_62204f14a6d17cad41d419d150" ON "structure" ("codePostal") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fa4dea9a1ff8deb8fcf47c451e" ON "structure" ("departement") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e848a2cfbd611ec5edc18074e2" ON "structure" ("region") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_30c4985e1148ec42ad6122f0ff" ON "structure" ("structureType") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fef5654bcc6595d885e57d1474" ON "usager" ("sexe") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d7abcf8875e8a94abf2dcf041e" ON "usager" ("dateNaissance") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b4d09870ec6cad2d2d98b7cc3a" ON "usager" ("migrated") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ef9fade8e5a6dac06ef5031986" ON "interactions" ("type") `
    );

    await queryRunner.query(
      `ALTER TABLE "message_sms" ADD CONSTRAINT "FK_dae89d90feda082fad814da8a48" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_notes" ADD CONSTRAINT "FK_6ca23b363643ae281d2f1eddf2f" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_notes" ADD CONSTRAINT "FK_e8b75cd4ebe81d288a6ff7d4115" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" ADD CONSTRAINT "FK_0389a8aa8e69b2d17210745d040" FOREIGN KEY ("userId") REFERENCES "user_structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP CONSTRAINT "FK_0389a8aa8e69b2d17210745d040"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_notes" DROP CONSTRAINT "FK_e8b75cd4ebe81d288a6ff7d4115"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_notes" DROP CONSTRAINT "FK_6ca23b363643ae281d2f1eddf2f"`
    );
    await queryRunner.query(
      `ALTER TABLE "message_sms" DROP CONSTRAINT "FK_dae89d90feda082fad814da8a48"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ef9fade8e5a6dac06ef5031986"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b4d09870ec6cad2d2d98b7cc3a"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d7abcf8875e8a94abf2dcf041e"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fef5654bcc6595d885e57d1474"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_30c4985e1148ec42ad6122f0ff"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e848a2cfbd611ec5edc18074e2"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fa4dea9a1ff8deb8fcf47c451e"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_62204f14a6d17cad41d419d150"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" ADD CONSTRAINT "UQ_cec1c2a0820383d2a4045b5f902" UNIQUE ("userId")`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" ADD CONSTRAINT "FK_0389a8aa8e69b2d17210745d040" FOREIGN KEY ("userId") REFERENCES "user_structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "options" SET DEFAULT '{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "telephone" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "options" DROP DEFAULT`
    );
    await queryRunner.query(`ALTER TABLE "usager" DROP COLUMN "oldNotes"`);
    await queryRunner.query(
      `ALTER TABLE "interactions" ADD "interactionOutUUIDTest" uuid`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ADD "notes" jsonb NOT NULL DEFAULT '[]'`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e8b75cd4ebe81d288a6ff7d411"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6ca23b363643ae281d2f1eddf2"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5d06e43196df8e4b02ceb16bc9"`
    );
    await queryRunner.query(`DROP TABLE "usager_notes"`);
  }
}
