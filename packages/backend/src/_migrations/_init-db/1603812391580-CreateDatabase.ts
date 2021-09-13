import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../../util";

// IMPORTANT: utilisé sur les branches PR pour initialiser la bdd: ne pas supprimer!!!
export class CreateDatabase1603812391580 implements MigrationInterface {
  name = "autoMigration1603812391580";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn("CREATION DB ....");

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await createTables(queryRunner);
    await createSequences(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // pas nécessaire de maintenir le down ici
  }
}
async function createSequences(queryRunner: QueryRunner) {
  await queryRunner.query(
    `CREATE SEQUENCE public.app_user_id_seq NO MINVALUE NO MAXVALUE`
  );
  await queryRunner.query(
    `CREATE SEQUENCE public.interactions_id_seq NO MINVALUE NO MAXVALUE`
  );
  await queryRunner.query(
    `CREATE SEQUENCE public.structure_doc_id_seq NO MINVALUE NO MAXVALUE`
  );
  await queryRunner.query(
    `CREATE SEQUENCE public.structure_id_seq NO MINVALUE NO MAXVALUE`
  );
}
async function createTables(queryRunner: QueryRunner) {
  appLogger.warn("> app_user");
  await queryRunner.query(
    `CREATE TABLE public.app_user (
        uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
        "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
        version integer NOT NULL,
        email text NOT NULL,
        fonction text,
        id integer NOT NULL,
        "lastLogin" timestamp with time zone,
        nom text NOT NULL,
        password text NOT NULL,
        prenom text NOT NULL,
        role text DEFAULT 'simple'::text NOT NULL,
        "structureId" integer NOT NULL,
        mails jsonb DEFAULT '{"guide": false, "import": false}'::jsonb NOT NULL,
        "passwordLastUpdate" timestamp with time zone,
        verified boolean DEFAULT false NOT NULL
        );
      `
  );

  appLogger.warn("> app_user_security");
  await queryRunner.query(
    `
      CREATE TABLE public.app_user_security (
        uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
        "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
        version integer NOT NULL,
        "userId" integer NOT NULL,
        "structureId" integer NOT NULL,
        "temporaryTokens" jsonb,
        "eventsHistory" jsonb DEFAULT '[]'::jsonb NOT NULL
        );
      `
  );

  appLogger.warn("> interactions");
  await queryRunner.query(
    `
        CREATE TABLE public.interactions (
          uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          "updatedAt" timestamptz NOT NULL DEFAULT now(),
          "version" int4 NOT NULL,
          "dateInteraction" timestamptz NOT NULL,
          "nbCourrier" int4 NOT NULL,
          "structureId" int4 NOT NULL,
          "type" text NOT NULL,
          "usagerRef" int4 NOT NULL,
          "userId" int4 NULL,
          "userName" text NOT NULL,
          "content" text NULL,
          "usagerUUID" uuid NOT NULL,
          "event" text NOT NULL DEFAULT 'create'::text,
          "previousValue" jsonb NULL,
          CONSTRAINT "PK_9cf825bde3ff3a979664feb460f" PRIMARY KEY (uuid)
        );
      `
  );

  appLogger.warn("> message_email");
  await queryRunner.query(
    `
      CREATE TABLE public.message_email (
        uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
        "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
        version integer NOT NULL,
        status text NOT NULL,
        "emailId" text NOT NULL,
        "initialScheduledDate" timestamp with time zone NOT NULL,
        "nextScheduledDate" timestamp with time zone NOT NULL,
        "sendDate" timestamp with time zone,
        content jsonb NOT NULL,
        "errorCount" integer DEFAULT 0 NOT NULL,
        "errorMessage" text,
        "sendDetails" jsonb,
        attachments bytea
        );
      `
  );

  appLogger.warn("> message_sms");
  await queryRunner.query(
    `
      CREATE TABLE public.message_sms (
        uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
        "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
        version integer NOT NULL,
        "usagerRef" integer NOT NULL,
        "structureId" integer NOT NULL,
        content text NOT NULL,
        status text DEFAULT 'TO_SEND'::text NOT NULL,
        "smsId" text NOT NULL,
        "scheduledDate" timestamp with time zone NOT NULL,
        "sendDate" timestamp with time zone,
        "interactionMetas" jsonb,
        "reminderMetas" jsonb,
        "statusUpdates" jsonb,
        "lastUpdate" timestamp with time zone,
        "errorCount" integer DEFAULT 0 NOT NULL,
        "errorMessage" text,
        "responseId" text,
        "phoneNumber" text NOT NULL,
        "senderName" text NOT NULL
      );
        `
  );

  appLogger.warn("> monitor_batch_process");
  await queryRunner.query(
    `
      CREATE TABLE public.monitor_batch_process (
        uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
        "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
        version integer NOT NULL,
        "processId" text NOT NULL,
        "beginDate" timestamp with time zone NOT NULL,
        "endDate" timestamp with time zone NOT NULL,
        trigger text NOT NULL,
        status text NOT NULL,
        details jsonb,
        "errorMessage" text,
        "alertMailSent" boolean DEFAULT false NOT NULL
      );
      `
  );

  appLogger.warn("> structure");
  await queryRunner.query(
    `
      CREATE TABLE public.structure (
        uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
        "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
        version integer NOT NULL,
        id integer NOT NULL,
        adresse text,
        "adresseCourrier" jsonb,
        agrement text,
        capacite integer,
        "codePostal" text,
        "complementAdresse" text,
        departement text,
        region text,
        email text,
        "hardReset" jsonb,
        "tokenDelete" text,
        import boolean DEFAULT false NOT NULL,
        "registrationDate" timestamp with time zone NOT NULL,
        "importDate" date,
        "lastLogin" date,
        nom text,
        options jsonb,
        phone text,
        responsable jsonb NOT NULL,
        "structureType" text NOT NULL,
        token text,
        verified boolean DEFAULT false NOT NULL,
        ville text,
        sms jsonb DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": false, "enabledByStructure": false}'::jsonb NOT NULL
      ); `
  );

  appLogger.warn("> structure_doc");
  await queryRunner.query(
    `CREATE TABLE public.structure_doc (
        uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
        "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
        version integer NOT NULL,
        id integer NOT NULL,
        label text NOT NULL,
        "createdBy" jsonb NOT NULL,
        tags jsonb,
        custom boolean DEFAULT false NOT NULL,
        filetype text NOT NULL,
        "structureId" integer NOT NULL,
        path text NOT NULL
      );`
  );

  appLogger.warn("> usager");
  await queryRunner.query(
    `CREATE TABLE public.usager (
        uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
        "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
        version integer NOT NULL,
        ref integer NOT NULL,
        "customRef" text NOT NULL,
        "structureId" integer NOT NULL,
        nom text NOT NULL,
        prenom text NOT NULL,
        surnom text,
        sexe text NOT NULL,
        "dateNaissance" timestamp with time zone NOT NULL,
        "villeNaissance" text NOT NULL,
        langue text,
        email text,
        phone text,
        preference jsonb DEFAULT '{"email": false, "phone": false, "phoneNumber": null}'::jsonb,
        "datePremiereDom" timestamp with time zone,
        "typeDom" text DEFAULT 'INSTRUCTION'::text,
        decision jsonb NOT NULL,
        historique jsonb NOT NULL,
        "ayantsDroits" jsonb,
        "lastInteraction" jsonb NOT NULL,
        docs jsonb DEFAULT '[]'::jsonb NOT NULL,
        "docsPath" jsonb DEFAULT '[]'::jsonb NOT NULL,
        "etapeDemande" integer DEFAULT 0 NOT NULL,
        rdv jsonb,
        entretien jsonb NOT NULL,
        options jsonb NOT NULL,
        import jsonb
      );`
  );

  appLogger.warn("> usager_history");
  await queryRunner.query(
    `CREATE TABLE public.usager_history (
        uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
        "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
        version integer NOT NULL,
        "usagerUUID" uuid NOT NULL,
        "usagerRef" integer NOT NULL,
        "structureId" integer NOT NULL,
        import jsonb,
        states jsonb NOT NULL
      );`
  );
}
