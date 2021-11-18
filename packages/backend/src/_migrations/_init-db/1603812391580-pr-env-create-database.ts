import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../../util";

// IMPORTANT: utilisé sur les branches PR pour initialiser la bdd au démarrage du serveur avec une base vide
export class CreateDatabase1603812391580 implements MigrationInterface {
  name = "autoMigration1603812391580";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn("CREATION DB ....");

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await createTables(queryRunner);
    // NOTE @toub 2021-11-02 : les séquences semblent crées automatiquement par typeorm, même avec "synchronize:false"
    // TODO: documentation de ce comportement?

    appLogger.warn("CREATION DB : SUCCESS");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // pas nécessaire de maintenir le down ici
  }
}

async function createTables(queryRunner: QueryRunner) {
  appLogger.warn("> CREATE TABLES");
  await queryRunner.query(
    `CREATE TABLE "structure" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "adresse" text, "adresseCourrier" jsonb, "agrement" text, "capacite" integer, "codePostal" text, "complementAdresse" text, "departement" text, "region" text, "email" text, "hardReset" jsonb, "tokenDelete" text, "import" boolean NOT NULL DEFAULT false, "registrationDate" TIMESTAMP WITH TIME ZONE NOT NULL, "importDate" date, "lastLogin" date, "nom" text, "options" jsonb, "phone" text, "responsable" jsonb NOT NULL, "structureType" text NOT NULL, "token" text, "verified" boolean NOT NULL DEFAULT true, "ville" text, "sms" jsonb NOT NULL DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false}', CONSTRAINT "UQ_90ac7986e769d602d218075215c" UNIQUE ("id"), CONSTRAINT "PK_a92a6b3dd54efb4ab48b2d6e7c1" PRIMARY KEY ("uuid"))`
  );
  await queryRunner.query(
    `CREATE INDEX "IDX_90ac7986e769d602d218075215" ON "structure" ("id") `
  );
  await queryRunner.query(
    `CREATE TABLE "usager" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "ref" integer NOT NULL, "customRef" text NOT NULL, "structureId" integer NOT NULL, "nom" text NOT NULL, "prenom" text NOT NULL, "surnom" text, "sexe" text NOT NULL, "dateNaissance" TIMESTAMP WITH TIME ZONE NOT NULL, "villeNaissance" text NOT NULL, "langue" text, "email" text, "phone" text, "preference" jsonb DEFAULT '{"email": false, "phone": false, "phoneNumber": null}', "datePremiereDom" TIMESTAMP WITH TIME ZONE, "typeDom" text DEFAULT 'INSTRUCTION', "import" jsonb, "decision" jsonb NOT NULL, "historique" jsonb NOT NULL, "ayantsDroits" jsonb, "lastInteraction" jsonb NOT NULL, "docs" jsonb NOT NULL DEFAULT '[]', "docsPath" jsonb NOT NULL DEFAULT '[]', "etapeDemande" integer NOT NULL DEFAULT '0', "rdv" jsonb, "notes" jsonb NOT NULL DEFAULT '[]', "entretien" jsonb NOT NULL, "options" jsonb NOT NULL, CONSTRAINT "UQ_e76056fb098740de66d58a5055a" UNIQUE ("structureId", "ref"), CONSTRAINT "PK_1bb36e24229bec446a281573612" PRIMARY KEY ("uuid"))`
  );
  await queryRunner.query(
    `CREATE INDEX "IDX_8198a25ae40584a38bce1dd4d2" ON "usager" ("ref") `
  );
  await queryRunner.query(
    `CREATE INDEX "IDX_a44d882d224e368efdee8eb8c8" ON "usager" ("structureId") `
  );
  await queryRunner.query(
    `CREATE TABLE "usager_history" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "usagerUUID" uuid NOT NULL, "usagerRef" integer NOT NULL, "structureId" integer NOT NULL, "import" jsonb, "states" jsonb NOT NULL, CONSTRAINT "UQ_7356ee08f3ac6e3e1c6fe08bd81" UNIQUE ("usagerUUID"), CONSTRAINT "UQ_29a873927e96c4290d288d594f4" UNIQUE ("structureId", "usagerRef"), CONSTRAINT "PK_29638b771d16000882db14bab40" PRIMARY KEY ("uuid"))`
  );
  await queryRunner.query(
    `CREATE INDEX "IDX_7356ee08f3ac6e3e1c6fe08bd8" ON "usager_history" ("usagerUUID") `
  );
  await queryRunner.query(
    `CREATE INDEX "IDX_36a2e869faca3bb31cbacdf81b" ON "usager_history" ("structureId") `
  );
  await queryRunner.query(
    `CREATE TABLE "interactions" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "dateInteraction" TIMESTAMP WITH TIME ZONE NOT NULL, "nbCourrier" integer NOT NULL, "structureId" integer NOT NULL, "type" text NOT NULL, "usagerRef" integer NOT NULL, "usagerUUID" uuid NOT NULL, "userId" integer, "userName" text NOT NULL, "content" text, "event" text NOT NULL DEFAULT 'create', "previousValue" jsonb, CONSTRAINT "PK_006113a10247f411c459d62a5b3" PRIMARY KEY ("uuid"))`
  );
  await queryRunner.query(
    `CREATE INDEX "IDX_1953f5ad67157bada8774f7e24" ON "interactions" ("structureId") `
  );
  await queryRunner.query(
    `CREATE INDEX "IDX_0c5d7e9585c77ff002d4072c3c" ON "interactions" ("usagerRef") `
  );
  await queryRunner.query(
    `CREATE INDEX "IDX_f9c3ee379ce68d4acfe4199a33" ON "interactions" ("usagerUUID") `
  );
  await queryRunner.query(
    `CREATE INDEX "IDX_9992157cbe54583ff7002ae4c0" ON "interactions" ("userId") `
  );
  await queryRunner.query(
    `CREATE TABLE "message_email" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "status" text NOT NULL, "emailId" text NOT NULL, "initialScheduledDate" TIMESTAMP WITH TIME ZONE NOT NULL, "nextScheduledDate" TIMESTAMP WITH TIME ZONE NOT NULL, "sendDate" TIMESTAMP WITH TIME ZONE, "content" jsonb NOT NULL, "errorCount" integer NOT NULL DEFAULT '0', "errorMessage" text, "sendDetails" jsonb, "attachments" bytea, CONSTRAINT "PK_6bffd9b803b67cd4e099fc795e1" PRIMARY KEY ("uuid"))`
  );
  await queryRunner.query(
    `CREATE TABLE "message_sms" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "usagerRef" integer NOT NULL, "structureId" integer NOT NULL, "content" text NOT NULL, "status" text NOT NULL DEFAULT 'TO_SEND', "smsId" text NOT NULL, "responseId" text, "scheduledDate" TIMESTAMP WITH TIME ZONE NOT NULL, "sendDate" TIMESTAMP WITH TIME ZONE, "interactionMetas" jsonb, "reminderMetas" jsonb, "statusUpdates" jsonb, "lastUpdate" TIMESTAMP WITH TIME ZONE, "errorCount" integer NOT NULL DEFAULT '0', "errorMessage" text, "phoneNumber" text NOT NULL, "senderName" text NOT NULL, CONSTRAINT "PK_4d9f00a5bf0f7f424985b156043" PRIMARY KEY ("uuid"))`
  );
  await queryRunner.query(
    `CREATE TABLE "monitor_batch_process" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "processId" text NOT NULL, "beginDate" TIMESTAMP WITH TIME ZONE NOT NULL, "endDate" TIMESTAMP WITH TIME ZONE NOT NULL, "trigger" text NOT NULL, "status" text NOT NULL, "details" jsonb, "errorMessage" text, "alertMailSent" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_499b68e4f8f59ccea90c48cb23c" PRIMARY KEY ("uuid"))`
  );
  await queryRunner.query(
    `CREATE TABLE "structure_doc" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "label" text NOT NULL, "createdBy" jsonb NOT NULL, "tags" jsonb, "custom" boolean NOT NULL DEFAULT false, "filetype" text NOT NULL, "structureId" integer NOT NULL, "path" text NOT NULL, "customDocType" text, "displayInPortailUsager" boolean DEFAULT false NOT NULL, CONSTRAINT "UQ_b1dfa7ef1934657b38072e749e3" UNIQUE ("id"), CONSTRAINT "PK_6d6be27ca865c8ba30b9c862b70" PRIMARY KEY ("uuid"))`
  );
  await queryRunner.query(
    `CREATE INDEX "IDX_b1dfa7ef1934657b38072e749e" ON "structure_doc" ("id") `
  );
  await queryRunner.query(
    `CREATE INDEX "IDX_d79d466c870df0b58864836899" ON "structure_doc" ("structureId") `
  );
  await queryRunner.query(
    `CREATE TABLE "user_structure" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "email" text NOT NULL, "fonction" text, "id" SERIAL NOT NULL, "lastLogin" TIMESTAMP WITH TIME ZONE, "nom" text NOT NULL, "password" text NOT NULL, "prenom" text NOT NULL, "role" text NOT NULL DEFAULT 'simple', "structureId" integer NOT NULL, "mails" jsonb NOT NULL DEFAULT '{"guide": false, "import": false}', "passwordLastUpdate" TIMESTAMP WITH TIME ZONE, "verified" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_e2828c51dc4d023377f256c9805" UNIQUE ("email"), CONSTRAINT "UQ_74b1b39487db0e5d3471b370cf9" UNIQUE ("id"), CONSTRAINT "PK_47ac9833624ae266812f869586a" PRIMARY KEY ("uuid"))`
  );
  await queryRunner.query(
    `CREATE INDEX "IDX_e2828c51dc4d023377f256c980" ON "user_structure" ("email") `
  );
  await queryRunner.query(
    `CREATE INDEX "IDX_74b1b39487db0e5d3471b370cf" ON "user_structure" ("id") `
  );
  await queryRunner.query(
    `CREATE INDEX "IDX_a52dec7d55b4a81a0af0136148" ON "user_structure" ("structureId") `
  );
  await queryRunner.query(
    `CREATE TABLE "user_structure_security" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "userId" integer NOT NULL, "structureId" integer NOT NULL, "temporaryTokens" jsonb, "eventsHistory" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "UQ_0389a8aa8e69b2d17210745d040" UNIQUE ("userId"), CONSTRAINT "PK_d39b64375b5e6c1b7f039795d81" PRIMARY KEY ("uuid"))`
  );
  await queryRunner.query(
    `CREATE INDEX "IDX_0389a8aa8e69b2d17210745d04" ON "user_structure_security" ("userId") `
  );
  await queryRunner.query(
    `CREATE INDEX "IDX_57be1bdd772eb3fea1e201317e" ON "user_structure_security" ("structureId") `
  );
  await queryRunner.query(
    `ALTER TABLE "usager" ADD CONSTRAINT "FK_a44d882d224e368efdee8eb8c80" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
  );
  await queryRunner.query(
    `ALTER TABLE "usager_history" ADD CONSTRAINT "FK_7356ee08f3ac6e3e1c6fe08bd81" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
  );
  await queryRunner.query(
    `ALTER TABLE "usager_history" ADD CONSTRAINT "FK_36a2e869faca3bb31cbacdf81ba" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
  );
  await queryRunner.query(
    `ALTER TABLE "interactions" ADD CONSTRAINT "FK_1953f5ad67157bada8774f7e245" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
  );
  await queryRunner.query(
    `ALTER TABLE "interactions" ADD CONSTRAINT "FK_f9c3ee379ce68d4acfe4199a335" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
  );
  await queryRunner.query(
    `ALTER TABLE "structure_doc" ADD CONSTRAINT "FK_d79d466c870df0b58864836899d" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
  );
  await queryRunner.query(
    `ALTER TABLE "user_structure" ADD CONSTRAINT "FK_a52dec7d55b4a81a0af01361485" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
  );
  await queryRunner.query(
    `ALTER TABLE "user_structure_security" ADD CONSTRAINT "FK_0389a8aa8e69b2d17210745d040" FOREIGN KEY ("userId") REFERENCES "user_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
  );
  await queryRunner.query(
    `ALTER TABLE "user_structure_security" ADD CONSTRAINT "FK_57be1bdd772eb3fea1e201317e6" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
  );
  await queryRunner.query(`ALTER TABLE "interactions" ADD COLUMN "id" serial`);
}
