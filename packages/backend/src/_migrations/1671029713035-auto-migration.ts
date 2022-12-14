import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1671029713035 implements MigrationInterface {
  name = "autoMigration1671029713035";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_entretien" DROP CONSTRAINT "FK_aa19c17fc79f4e4a648643096f9"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_entretien" ADD CONSTRAINT "UQ_aa19c17fc79f4e4a648643096f9" UNIQUE ("usagerUUID")`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "telephone" SET DEFAULT '{"countryCode": "fr", "numero": ""}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "options" SET DEFAULT ''`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_entretien" ADD CONSTRAINT "UQ_5f4220e5a3e6d2ee1c1bb7fd3d2" UNIQUE ("structureId", "usagerRef")`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_entretien" ADD CONSTRAINT "FK_aa19c17fc79f4e4a648643096f9" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_entretien" DROP CONSTRAINT "FK_aa19c17fc79f4e4a648643096f9"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_entretien" DROP CONSTRAINT "UQ_5f4220e5a3e6d2ee1c1bb7fd3d2"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "options" SET DEFAULT '{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_entretien" DROP CONSTRAINT "UQ_aa19c17fc79f4e4a648643096f9"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_entretien" ADD CONSTRAINT "FK_aa19c17fc79f4e4a648643096f9" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" DROP CONSTRAINT "UQ_b36e92e49b2a68f8fea64ec8d5b"`
    );
  }
}
