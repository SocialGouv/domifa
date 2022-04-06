import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { appLogger } from "../util";

export class createPhoneUsagerMigration1647967164574
  implements MigrationInterface
{
  name = "createPhoneUsagerMigration1647967164574";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      appLogger.warn(
        "[MIGRATION] Créer le nouvel élément téléphone dans les usagers"
      );

      await queryRunner.query(
        `ALTER TABLE "usager" ADD "telephone" jsonb DEFAULT '{"indicatif": "+33", "numero": ""}'`
      );
      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"email": false, "phone": false, "phoneNumber": null, "telephone": null}'`
      );

      appLogger.warn("[MIGRATION] Créer le nouvel élément dans les structures");

      await queryRunner.query(
        `ALTER TABLE "structure" ADD "telephone" jsonb NOT NULL DEFAULT '{"indicatif": "+33", "numero": ""}'`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"email": false, "phone": false, "phoneNumber": null}'`
    );
    await queryRunner.query(`ALTER TABLE "usager" DROP COLUMN "telephone"`);
  }
}
