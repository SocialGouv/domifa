import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1655733980535 implements MigrationInterface {
  name = "autoMigration1655733980535";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"countryCode": "fr", "numero": ""}'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "options" SET DEFAULT '{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}'`
    );
  }
}
