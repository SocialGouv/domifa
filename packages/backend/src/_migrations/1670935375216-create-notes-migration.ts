import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class createNotesMigration1670935375216 implements MigrationInterface {
  name = "createNotesMigration1670935375216";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "dev" || domifaConfig().envId === "test") {
      return;
    }

    console.log("[MIGRATION] Création des notes ");
    await queryRunner.query(
      `CREATE TABLE "usager_notes" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "usagerUUID" uuid NOT NULL, "structureId" integer NOT NULL, "usagerRef" integer NOT NULL, "message" text NOT NULL, "archived" boolean NOT NULL DEFAULT false, "createdBy" jsonb, "archivedBy" jsonb, "archivedAt" date, CONSTRAINT "UQ_5d06e43196df8e4b02ceb16bc9a" UNIQUE ("id"), CONSTRAINT "PK_11acb926f75642e9dcdd97e5be1" PRIMARY KEY ("uuid"))`
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

    console.log("[MIGRATION] Delete old structure");
    try {
      await queryRunner.query(`DELETE FROM structure where id = 929`);
    } catch (e) {
      console.log("Structure 929 déjà supprimée");
    }

    try {
      console.log("[MIGRATION] Remove unused data in interactions");

      await queryRunner.query(
        `ALTER TABLE "interactions" DROP COLUMN "interactionOutUUIDTest"`
      );
    } catch (e) {
      console.log("interactionOutUUIDTest not exists");
    }

    console.log("[MIGRATION] Update phone");

    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "telephone" SET NOT NULL`
    );

    console.log("[MIGRATION] Update indexes and constraints");

    await queryRunner.query(
      `CREATE INDEX "IDX_9643302335674f651c0e867235" ON "app_log" ("userId") `
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
      `CREATE INDEX "IDX_b36e92e49b2a68f8fea64ec8d5" ON "structure" ("email") `
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
      `CREATE INDEX "IDX_32f34de1c043658f4843e62218" ON "usager" ("typeDom") `
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_b4d09870ec6cad2d2d98b7cc3a" ON "usager" ("migrated") `
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_ef9fade8e5a6dac06ef5031986" ON "interactions" ("type") `
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_3bc72392a39f586374f0f7d577" ON "interactions" ("event") `
    );

    await queryRunner.query(
      `ALTER TABLE "usager_notes" ADD CONSTRAINT "FK_6ca23b363643ae281d2f1eddf2f" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "usager_notes" ADD CONSTRAINT "FK_e8b75cd4ebe81d288a6ff7d4115" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "message_sms" ADD CONSTRAINT "FK_dae89d90feda082fad814da8a48" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "structure" ADD CONSTRAINT " " UNIQUE ("email")`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    console.log("DOWN");
  }
}
