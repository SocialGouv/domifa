import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1759327920930 implements MigrationInterface {
  name = "AutoMigration1759327920930";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "structure" DROP COLUMN "tokenDelete"`
      );
      await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "verified"`);

      await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "token"`);
      await queryRunner.query(
        `ALTER TABLE "structure" ADD "statut" text NOT NULL DEFAULT 'EN_ATTENTE'`
      );
      await queryRunner.query(`ALTER TABLE "structure" ADD "decision" jsonb`);
      await queryRunner.query(
        `ALTER TABLE "structure" ALTER COLUMN "telephone" DROP DEFAULT`
      );
      await queryRunner.query(
        `ALTER TABLE "expired_token" DROP CONSTRAINT "FK_4252acc4e242ad123a5d7b06252"`
      );
      await queryRunner.query(
        `ALTER TABLE "expired_token" ALTER COLUMN "structureId" DROP NOT NULL`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP COLUMN "fonctionDetail"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD "fonctionDetail" character varying(255)`
    );

    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "decision"`);
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "statut"`);
    await queryRunner.query(`ALTER TABLE "structure" ADD "token" text`);
    await queryRunner.query(`ALTER TABLE "structure" ADD "tokenDelete" text`);
    await queryRunner.query(
      `ALTER TABLE "structure" ADD "verified" boolean NOT NULL DEFAULT false`
    );
  }
}
