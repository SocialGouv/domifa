import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1683671702588 implements MigrationInterface {
  name = "AutoMigration1683671702588";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "usager_notes" ADD "pinned" boolean NOT NULL DEFAULT false`
      );
      await queryRunner.query(`ALTER TABLE "usager" ADD "pinnedNote" jsonb`);

      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "lastInteraction" SET DEFAULT '{"dateInteraction":"NOW()", "enAttente":"false", "courrierIn":"0", "recommandeIn":"0", "colisIn":"0"}'`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_d9c81cf63a13921c118dfda46b" ON "message_sms" ("phoneNumber") `
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d9c81cf63a13921c118dfda46b"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "options" SET DEFAULT '{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "lastInteraction" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(`ALTER TABLE "usager" DROP COLUMN "pinnedNote"`);
    await queryRunner.query(`ALTER TABLE "usager_notes" DROP COLUMN "pinned"`);
  }
}
