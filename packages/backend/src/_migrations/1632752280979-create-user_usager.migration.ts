import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class CreateUserUsager1632752280979 implements MigrationInterface {
  name = "CreateUserUsager1632752280979";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn(`[${this.name}] MIGRATION UP...`);

    await queryRunner.query(
      `CREATE TABLE "user_usager" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "usagerUUID" uuid NOT NULL, "structureId" integer NOT NULL, "login" text NOT NULL, "password" text NOT NULL, "salt" text NOT NULL, "isTemporaryPassword" boolean NOT NULL DEFAULT false, "lastLogin" TIMESTAMP WITH TIME ZONE, "passwordLastUpdate" TIMESTAMP WITH TIME ZONE, "lastPasswordResetDate" TIMESTAMP WITH TIME ZONE, "lastPasswordResetStructureUser" jsonb, "enabled" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_547d83b925177cadc602bc7e221" UNIQUE ("id"), CONSTRAINT "UQ_07ddbb376616a6bf4ffdbb2b6d7" UNIQUE ("usagerUUID"), CONSTRAINT "UQ_7d7ff538b491444ce070065252c" UNIQUE ("login"), CONSTRAINT "PK_46cd95ba6c330d680e13ce7d932" PRIMARY KEY ("uuid"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_547d83b925177cadc602bc7e22" ON "user_usager" ("id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_07ddbb376616a6bf4ffdbb2b6d" ON "user_usager" ("usagerUUID") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0d31ec098c9d4e0507712b7f77" ON "user_usager" ("structureId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7d7ff538b491444ce070065252" ON "user_usager" ("login") `
    );
    await queryRunner.query(
      `CREATE TABLE "user_usager_security" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "userId" integer NOT NULL, "structureId" integer NOT NULL, "eventsHistory" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "UQ_0b7885e1594c7af3a5b84a4bdb3" UNIQUE ("userId"), CONSTRAINT "PK_bae071b5eb7273c0b3d82e670d1" PRIMARY KEY ("uuid"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0b7885e1594c7af3a5b84a4bdb" ON "user_usager_security" ("userId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_066d08686fd781a7ea049b115a" ON "user_usager_security" ("structureId") `
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager" ADD CONSTRAINT "FK_07ddbb376616a6bf4ffdbb2b6d7" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager" ADD CONSTRAINT "FK_0d31ec098c9d4e0507712b7f77c" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" ADD CONSTRAINT "FK_0b7885e1594c7af3a5b84a4bdb3" FOREIGN KEY ("userId") REFERENCES "user_usager"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" ADD CONSTRAINT "FK_066d08686fd781a7ea049b115a2" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."structure" ADD "portailUsager" jsonb NOT NULL DEFAULT '{ "enabledByDomifa": false, "enabledByStructure": false }'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."structure" DROP COLUMN "portailUsager"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" DROP CONSTRAINT "FK_066d08686fd781a7ea049b115a2"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" DROP CONSTRAINT "FK_0b7885e1594c7af3a5b84a4bdb3"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager" DROP CONSTRAINT "FK_0d31ec098c9d4e0507712b7f77c"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager" DROP CONSTRAINT "FK_07ddbb376616a6bf4ffdbb2b6d7"`
    );
    await queryRunner.query(`DROP INDEX "IDX_066d08686fd781a7ea049b115a"`);
    await queryRunner.query(`DROP INDEX "IDX_0b7885e1594c7af3a5b84a4bdb"`);
    await queryRunner.query(`DROP TABLE "user_usager_security"`);
    await queryRunner.query(`DROP INDEX "IDX_7d7ff538b491444ce070065252"`);
    await queryRunner.query(`DROP INDEX "IDX_0d31ec098c9d4e0507712b7f77"`);
    await queryRunner.query(`DROP INDEX "IDX_07ddbb376616a6bf4ffdbb2b6d"`);
    await queryRunner.query(`DROP INDEX "IDX_547d83b925177cadc602bc7e22"`);
    await queryRunner.query(`DROP TABLE "user_usager"`);
  }
}
