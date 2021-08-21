import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../../util";

// IMPORTANT: utilisé sur les branches PR pour initialiser la bdd: ne pas supprimer!!!
export class CreateDatabase1603812391580 implements MigrationInterface {
  name = "autoMigration1603812391580";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn("CREATION DB ....");

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    appLogger.warn("> app_user");
    await queryRunner.query(
      `
      CREATE TABLE public.app_user (
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
          CONSTRAINT "PK_9cf825bde3ff3a979664feb460f" PRIMARY KEY (uuid, id)
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure_doc" DROP CONSTRAINT "FK_d79d466c870df0b58864836899d"`
    );
    await queryRunner.query(
      `ALTER TABLE "app_user_security" DROP CONSTRAINT "FK_4950bb2d2181b91b9219f9039c9"`
    );
    await queryRunner.query(
      `ALTER TABLE "app_user_security" DROP CONSTRAINT "FK_cec1c2a0820383d2a4045b5f902"`
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" DROP CONSTRAINT "FK_64204d3f209764ef8d08f334bd7"`
    );

    await queryRunner.query(
      `ALTER TABLE "interactions" DROP CONSTRAINT "FK_f9c3ee379ce68d4acfe4199a335"`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP CONSTRAINT "FK_1953f5ad67157bada8774f7e245"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" DROP CONSTRAINT "FK_a44d882d224e368efdee8eb8c80"`
    );
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
    await queryRunner.query(`DROP INDEX "IDX_7356ee08f3ac6e3e1c6fe08bd8"`);
    await queryRunner.query(`DROP TABLE "usager_history"`);
    await queryRunner.query(`DROP INDEX "IDX_90ac7986e769d602d218075215"`);
    await queryRunner.query(`DROP TABLE "structure"`);
  }
}
