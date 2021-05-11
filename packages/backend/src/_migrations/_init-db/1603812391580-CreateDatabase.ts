import { MigrationInterface, QueryRunner } from "typeorm";

// IMPORTANT: utilisé sur les branches PR pour initialiser la bdd: ne pas supprimer!!!
export class CreateDatabase1603812391580 implements MigrationInterface {
    name = 'autoMigration1603812391580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TABLE "structure" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "adresse" text, "adresseCourrier" jsonb, "agrement" text, "capacite" integer, "codePostal" text, "complementAdresse" text, "departement" text, "region" text, "email" text, "hardReset" jsonb, "tokenDelete" text, "import" boolean NOT NULL DEFAULT false, "registrationDate" TIMESTAMP WITH TIME ZONE NOT NULL, "importDate" date, "lastLogin" date, "nom" text, "options" jsonb, "phone" text, "responsable" jsonb NOT NULL, "stats" jsonb NOT NULL, "structureType" text NOT NULL, "token" text, "verified" boolean NOT NULL DEFAULT false, "ville" text, "sms" jsonb NOT NULL DEFAULT '{ "enabledByDomifa": false, "enabledByStructure": false, "senderName": null, "senderDetails": null }', CONSTRAINT "UQ_90ac7986e769d602d218075215c" UNIQUE ("id"), CONSTRAINT "PK_a92a6b3dd54efb4ab48b2d6e7c1" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`CREATE INDEX "IDX_90ac7986e769d602d218075215" ON "structure" ("id") `);
        await queryRunner.query(`CREATE TABLE "usager" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "ref" integer NOT NULL, "customRef" text NOT NULL, "structureId" integer NOT NULL, "nom" text NOT NULL, "prenom" text NOT NULL, "surnom" text, "sexe" text NOT NULL, "dateNaissance" TIMESTAMP WITH TIME ZONE NOT NULL, "villeNaissance" text NOT NULL, "langue" text, "email" text, "phone" text, "preference" jsonb DEFAULT '{"email": false, "phone": false, "phoneNumber":null}', "datePremiereDom" TIMESTAMP WITH TIME ZONE, "typeDom" text DEFAULT 'INSTRUCTION', "decision" jsonb NOT NULL, "historique" jsonb NOT NULL, "ayantsDroits" jsonb, "lastInteraction" jsonb NOT NULL, "docs" jsonb NOT NULL DEFAULT '[]', "docsPath" jsonb NOT NULL DEFAULT '[]', "etapeDemande" integer NOT NULL DEFAULT '0', "rdv" jsonb, "entretien" jsonb NOT NULL, "options" jsonb NOT NULL, CONSTRAINT "UQ_e76056fb098740de66d58a5055a" UNIQUE ("structureId", "ref"), CONSTRAINT "PK_1bb36e24229bec446a281573612" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8198a25ae40584a38bce1dd4d2" ON "usager" ("ref") `);
        await queryRunner.query(`CREATE INDEX "IDX_a44d882d224e368efdee8eb8c8" ON "usager" ("structureId") `);
        await queryRunner.query(`CREATE TABLE "interactions" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "dateInteraction" TIMESTAMP WITH TIME ZONE NOT NULL, "nbCourrier" integer NOT NULL, "structureId" integer NOT NULL, "type" text NOT NULL, "usagerRef" integer NOT NULL, "usagerUUID" uuid NOT NULL, "userId" integer, "userName" text NOT NULL, "content" text, CONSTRAINT "PK_9cf825bde3ff3a979664feb460f" PRIMARY KEY ("uuid", "id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1953f5ad67157bada8774f7e24" ON "interactions" ("structureId") `);
        await queryRunner.query(`CREATE INDEX "IDX_0c5d7e9585c77ff002d4072c3c" ON "interactions" ("usagerRef") `);
        await queryRunner.query(`CREATE INDEX "IDX_f9c3ee379ce68d4acfe4199a33" ON "interactions" ("usagerUUID") `);
        await queryRunner.query(`CREATE INDEX "IDX_9992157cbe54583ff7002ae4c0" ON "interactions" ("userId") `);
        await queryRunner.query(`CREATE TABLE "message_email" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "status" text NOT NULL, "emailId" text NOT NULL, "initialScheduledDate" TIMESTAMP WITH TIME ZONE NOT NULL, "nextScheduledDate" TIMESTAMP WITH TIME ZONE NOT NULL, "sendDate" TIMESTAMP WITH TIME ZONE, "content" jsonb NOT NULL, "errorCount" integer NOT NULL DEFAULT '0', "errorMessage" text, "sendDetails" jsonb, "attachments" bytea, CONSTRAINT "PK_6bffd9b803b67cd4e099fc795e1" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`CREATE TABLE "monitor_batch_process" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "processId" text NOT NULL, "beginDate" TIMESTAMP WITH TIME ZONE NOT NULL, "endDate" TIMESTAMP WITH TIME ZONE NOT NULL, "trigger" text NOT NULL, "status" text NOT NULL, "details" jsonb, "errorMessage" text, "alertMailSent" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_499b68e4f8f59ccea90c48cb23c" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`CREATE TABLE "structure_stats" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "nom" text NOT NULL, "date" date NOT NULL, "structureId" integer NOT NULL, "structureType" text NOT NULL, "departement" text NOT NULL, "ville" text NOT NULL, "capacite" integer, "codePostal" text NOT NULL, "questions" jsonb NOT NULL, "generated" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_102c69c2491695e723e3b7ed4ec" UNIQUE ("date", "structureId"), CONSTRAINT "PK_ed21deae6f1374998af1cb267b9" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`CREATE INDEX "IDX_32881a91eaf51f28d3f9cf0958" ON "structure_stats" ("structureId") `);
        await queryRunner.query(`CREATE TABLE "app_user" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "email" text NOT NULL, "fonction" text, "id" SERIAL NOT NULL, "lastLogin" TIMESTAMP WITH TIME ZONE, "nom" text NOT NULL, "password" text NOT NULL, "prenom" text NOT NULL, "role" text NOT NULL DEFAULT 'simple', "structureId" integer NOT NULL, "mails" jsonb NOT NULL DEFAULT '{"guide": false, "import": false}', "passwordLastUpdate" TIMESTAMP WITH TIME ZONE, "verified" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_3fa909d0e37c531ebc237703391" UNIQUE ("email"), CONSTRAINT "UQ_22a5c4a3d9b2fb8e4e73fc4ada1" UNIQUE ("id"), CONSTRAINT "PK_a58dc229068f494a0360b170322" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3fa909d0e37c531ebc23770339" ON "app_user" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_22a5c4a3d9b2fb8e4e73fc4ada" ON "app_user" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_64204d3f209764ef8d08f334bd" ON "app_user" ("structureId") `);
        await queryRunner.query(`CREATE TABLE "app_user_security" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "userId" integer NOT NULL, "structureId" integer NOT NULL, "temporaryTokens" jsonb, "eventsHistory" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "UQ_cec1c2a0820383d2a4045b5f902" UNIQUE ("userId"), CONSTRAINT "PK_a617f0127221193d06271877ae0" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cec1c2a0820383d2a4045b5f90" ON "app_user_security" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4950bb2d2181b91b9219f9039c" ON "app_user_security" ("structureId") `);
        await queryRunner.query(`CREATE TABLE "message_sms" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "usagerRef" integer NOT NULL, "structureId" integer NOT NULL, "content" text NOT NULL, "status" text NOT NULL DEFAULT 'TO_SEND', "smsId" text NOT NULL, "responseId" text, "scheduledDate" TIMESTAMP WITH TIME ZONE NOT NULL, "sendDate" TIMESTAMP WITH TIME ZONE, "interactionMetas" jsonb, "reminderMetas" jsonb, "statusUpdates" jsonb, "lastUpdate" TIMESTAMP WITH TIME ZONE, "errorCount" integer NOT NULL DEFAULT '0', "errorMessage" text, "phoneNumber" text NOT NULL, "senderName" text NOT NULL, CONSTRAINT "PK_4d9f00a5bf0f7f424985b156043" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`CREATE TABLE "structure_doc" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "label" text NOT NULL, "createdBy" jsonb NOT NULL, "tags" jsonb, "custom" boolean NOT NULL DEFAULT false, "filetype" text NOT NULL, "structureId" integer NOT NULL, "path" text NOT NULL, CONSTRAINT "UQ_b1dfa7ef1934657b38072e749e3" UNIQUE ("id"), CONSTRAINT "PK_6d6be27ca865c8ba30b9c862b70" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b1dfa7ef1934657b38072e749e" ON "structure_doc" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_d79d466c870df0b58864836899" ON "structure_doc" ("structureId") `);
        await queryRunner.query(`ALTER TABLE "usager" ADD CONSTRAINT "FK_a44d882d224e368efdee8eb8c80" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "interactions" ADD CONSTRAINT "FK_1953f5ad67157bada8774f7e245" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "interactions" ADD CONSTRAINT "FK_f9c3ee379ce68d4acfe4199a335" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "structure_stats" ADD CONSTRAINT "FK_32881a91eaf51f28d3f9cf09589" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app_user" ADD CONSTRAINT "FK_64204d3f209764ef8d08f334bd7" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app_user_security" ADD CONSTRAINT "FK_cec1c2a0820383d2a4045b5f902" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app_user_security" ADD CONSTRAINT "FK_4950bb2d2181b91b9219f9039c9" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "structure_doc" ADD CONSTRAINT "FK_d79d466c870df0b58864836899d" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "structure_doc" DROP CONSTRAINT "FK_d79d466c870df0b58864836899d"`);
        await queryRunner.query(`ALTER TABLE "app_user_security" DROP CONSTRAINT "FK_4950bb2d2181b91b9219f9039c9"`);
        await queryRunner.query(`ALTER TABLE "app_user_security" DROP CONSTRAINT "FK_cec1c2a0820383d2a4045b5f902"`);
        await queryRunner.query(`ALTER TABLE "app_user" DROP CONSTRAINT "FK_64204d3f209764ef8d08f334bd7"`);
        await queryRunner.query(`ALTER TABLE "structure_stats" DROP CONSTRAINT "FK_32881a91eaf51f28d3f9cf09589"`);
        await queryRunner.query(`ALTER TABLE "interactions" DROP CONSTRAINT "FK_f9c3ee379ce68d4acfe4199a335"`);
        await queryRunner.query(`ALTER TABLE "interactions" DROP CONSTRAINT "FK_1953f5ad67157bada8774f7e245"`);
        await queryRunner.query(`ALTER TABLE "usager" DROP CONSTRAINT "FK_a44d882d224e368efdee8eb8c80"`);
        await queryRunner.query(`DROP INDEX "IDX_d79d466c870df0b58864836899"`);
        await queryRunner.query(`DROP INDEX "IDX_b1dfa7ef1934657b38072e749e"`);
        await queryRunner.query(`DROP TABLE "structure_doc"`);
        await queryRunner.query(`DROP TABLE "message_sms"`);
        await queryRunner.query(`DROP INDEX "IDX_4950bb2d2181b91b9219f9039c"`);
        await queryRunner.query(`DROP INDEX "IDX_cec1c2a0820383d2a4045b5f90"`);
        await queryRunner.query(`DROP TABLE "app_user_security"`);
        await queryRunner.query(`DROP INDEX "IDX_64204d3f209764ef8d08f334bd"`);
        await queryRunner.query(`DROP INDEX "IDX_22a5c4a3d9b2fb8e4e73fc4ada"`);
        await queryRunner.query(`DROP INDEX "IDX_3fa909d0e37c531ebc23770339"`);
        await queryRunner.query(`DROP TABLE "app_user"`);
        await queryRunner.query(`DROP INDEX "IDX_32881a91eaf51f28d3f9cf0958"`);
        await queryRunner.query(`DROP TABLE "structure_stats"`);
        await queryRunner.query(`DROP TABLE "monitor_batch_process"`);
        await queryRunner.query(`DROP TABLE "message_email"`);
        await queryRunner.query(`DROP INDEX "IDX_9992157cbe54583ff7002ae4c0"`);
        await queryRunner.query(`DROP INDEX "IDX_f9c3ee379ce68d4acfe4199a33"`);
        await queryRunner.query(`DROP INDEX "IDX_0c5d7e9585c77ff002d4072c3c"`);
        await queryRunner.query(`DROP INDEX "IDX_1953f5ad67157bada8774f7e24"`);
        await queryRunner.query(`DROP TABLE "interactions"`);
        await queryRunner.query(`DROP INDEX "IDX_a44d882d224e368efdee8eb8c8"`);
        await queryRunner.query(`DROP INDEX "IDX_8198a25ae40584a38bce1dd4d2"`);
        await queryRunner.query(`DROP TABLE "usager"`);
        await queryRunner.query(`DROP INDEX "IDX_90ac7986e769d602d218075215"`);
        await queryRunner.query(`DROP TABLE "structure"`);
    }

}
