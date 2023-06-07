import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AddEncryptionTextMigration1686137674369
  implements MigrationInterface
{
  name = "AddEncryptionTextMigration1686137674369";

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log("[MIGRATION] Création des éléments encryption");
    if (
      domifaConfig().envId === "local" ||
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod"
    ) {
      await queryRunner.query(`ALTER TABLE "structure_doc" DROP COLUMN "tags"`);
      await queryRunner.query(
        `ALTER TABLE "structure" ADD "migrated" boolean NOT NULL DEFAULT false`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_docs" ADD "encryptionContext" text`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_docs" ADD "encryptionVersion" integer`
      );
      await queryRunner.query(
        `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"countryCode": "fr", "numero": ""}'`
      );
      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "telephone" SET DEFAULT '{"countryCode":"fr", "numero":""}'`
      );
      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "lastInteraction" SET DEFAULT '{"dateInteraction":"NOW()", "enAttente":"false", "courrierIn":"0", "recommandeIn":"0", "colisIn":"0"}'`
      );
      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "options" SET DEFAULT '{"transfert":{"actif":false,"nom":null,"adresse":null,"dateDebut":null,"dateFin":null},"procurations":[],"npai":{"actif":false,"dateDebut":null},"portailUsagerEnabled":false}'`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "options" SET DEFAULT '{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "lastInteraction" SET DEFAULT '{"colisIn": "0", "enAttente": "false", "courrierIn": "0", "recommandeIn": "0", "dateInteraction": "NOW()"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_docs" DROP COLUMN "encryptionVersion"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_docs" DROP COLUMN "encryptionContext"`
    );
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "migrated"`);
    await queryRunner.query(`ALTER TABLE "structure_doc" ADD "tags" jsonb`);
  }
}
