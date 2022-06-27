import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class autoMigration1656365730544 implements MigrationInterface {
  name = "autoMigration1656365730544";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "phone"`);
      await queryRunner.query(
        `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"countryCode": "fr", "numero": ""}'`
      );
      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "telephone" SET DEFAULT '{"countryCode": "fr", "numero": ""}'`
      );
      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"phone": false, "telephone": {"countryCode": "fr", "numero": ""}}'`
      );
      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "options" SET DEFAULT '{ "transfert":{ "actif":false, "nom":null, "adresse":null, "dateDebut":null, "dateFin":null }, "procurations":[], "npai":{ "actif":false, "dateDebut":null }, "portailUsagerEnabled":false }'`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_docs" ADD CONSTRAINT "FK_08c4299b8abc6b9f548f2aece20" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_docs" ADD CONSTRAINT "FK_b1db67565e53acec53d5f3aa926" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_docs" DROP CONSTRAINT "FK_b1db67565e53acec53d5f3aa926"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_docs" DROP CONSTRAINT "FK_08c4299b8abc6b9f548f2aece20"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "options" SET DEFAULT '{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"phone": false, "telephone": {"numero": "", "indicatif": "fr"}, "phoneNumber": null}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "indicatif": "fr"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(`ALTER TABLE "structure" ADD "phone" text`);
  }
}
