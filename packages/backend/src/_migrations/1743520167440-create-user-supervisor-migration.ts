import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1743520167440 implements MigrationInterface {
  name = "AutoMigration1743520167440";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "user_structure_security" DROP CONSTRAINT "FK_57be1bdd772eb3fea1e201317e6"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure_security" DROP CONSTRAINT "FK_0389a8aa8e69b2d17210745d040"`
      );
      await queryRunner.query(
        `DROP INDEX "public"."IDX_57be1bdd772eb3fea1e201317e"`
      );
      await queryRunner.query(
        `DROP INDEX "public"."IDX_62204f14a6d17cad41d419d150"`
      );
      await queryRunner.query(
        `CREATE TABLE "user_supervisor" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "email" text NOT NULL, "fonction" text, "id" SERIAL NOT NULL, "lastLogin" TIMESTAMP WITH TIME ZONE, "nom" text NOT NULL, "password" text NOT NULL, "prenom" text NOT NULL, "passwordLastUpdate" TIMESTAMP WITH TIME ZONE, "verified" boolean NOT NULL DEFAULT true, "acceptTerms" TIMESTAMP WITH TIME ZONE, "territories" jsonb NOT NULL DEFAULT '[]', "role" text NOT NULL, CONSTRAINT "UQ_c2d4b5706fc542d95a0bf13869b" UNIQUE ("email"), CONSTRAINT "UQ_eba1b8ef0f72cb0dd4997307145" UNIQUE ("id"), CONSTRAINT "PK_fd859b169ff3833fed4b4769aa4" PRIMARY KEY ("uuid"))`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_c2d4b5706fc542d95a0bf13869" ON "user_supervisor" ("email") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_eba1b8ef0f72cb0dd499730714" ON "user_supervisor" ("id") `
      );
      await queryRunner.query(
        `CREATE TABLE "user_supervisor_security" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "userId" integer NOT NULL,  "temporaryTokens" jsonb, "eventsHistory" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_afc34ab2b3531b41455a9e016b5" PRIMARY KEY ("uuid"))`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_94c17da6c8fc82ac679eefd3ec" ON "user_supervisor_security" ("userId") `
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure_security" DROP COLUMN "structureId"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure" DROP COLUMN "territories"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure" DROP COLUMN "userRightStatus"`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_supervisor_security" DROP CONSTRAINT "FK_214a3530c4f1bcc65827f80d69c"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_supervisor_security" DROP CONSTRAINT "FK_94c17da6c8fc82ac679eefd3ecb"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP CONSTRAINT "FK_0389a8aa8e69b2d17210745d040"`
    );

    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "options" SET DEFAULT '{"surnom": false, "numeroBoite": true}'`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD "userRightStatus" text NOT NULL DEFAULT 'structure'`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD "territories" text`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" ADD "structureId" integer NOT NULL`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_214a3530c4f1bcc65827f80d69"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_94c17da6c8fc82ac679eefd3ec"`
    );
    await queryRunner.query(`DROP TABLE "user_supervisor_security"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_eba1b8ef0f72cb0dd499730714"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c2d4b5706fc542d95a0bf13869"`
    );
    await queryRunner.query(`DROP TABLE "user_supervisor"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_62204f14a6d17cad41d419d150" ON "structure" ("codePostal") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_57be1bdd772eb3fea1e201317e" ON "user_structure_security" ("structureId") `
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" ADD CONSTRAINT "FK_0389a8aa8e69b2d17210745d040" FOREIGN KEY ("userId") REFERENCES "user_structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" ADD CONSTRAINT "FK_57be1bdd772eb3fea1e201317e6" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }
}
