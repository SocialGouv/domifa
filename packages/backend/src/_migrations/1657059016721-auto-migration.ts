import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1657059016721 implements MigrationInterface {
  name = "autoMigration1657059016721";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"countryCode": "fr", "numero": ""}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "customRef" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "telephone" SET DEFAULT '{"countryCode": "fr", "numero": ""}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"contactByPhone": false, "telephone": {"countryCode": "fr", "numero": ""}}'`
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
      `ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"phone": false, "telephone": {"numero": "", "countryCode": "fr"}}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "customRef" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
  }
}
