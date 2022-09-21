import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1663779454193 implements MigrationInterface {
  name = "autoMigration1663779454193";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "options" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "options" SET DEFAULT '{"usagerLoginUpdateLastInteraction": false, "numeroBoite": false}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"countryCode": "fr", "numero": ""}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "telephone" SET DEFAULT '{"countryCode": "fr", "numero": ""}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "options" SET DEFAULT '{ "transfert":{ "actif":false, "nom":null, "adresse":null, "dateDebut":null, "dateFin":null }, "procurations":[], "npai":{ "actif":false, "dateDebut":null }, "portailUsagerEnabled":false }'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "options" SET DEFAULT '{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "options" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "options" DROP NOT NULL`
    );
  }
}
