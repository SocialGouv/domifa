import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../../util";

// IMPORTANT: utilisé sur les branches PR pour initialiser la bdd au démarrage du serveur avec une base vide
export class CreateDatabase1603812391580 implements MigrationInterface {
  name = "autoMigration1603812391580";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn("CREATION DB ....");

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await createTables(queryRunner);

    appLogger.warn("CREATION DB : SUCCESS");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // pas nécessaire de maintenir le down ici
  }
}

async function createTables(queryRunner: QueryRunner) {
  appLogger.warn("> CREATE TABLES");

  await queryRunner.query(
    `
    -- public.log definition

    -- Drop table

    -- DROP TABLE log;

    CREATE TABLE log (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      "userId" int4 NOT NULL,
      "usagerRef" int4 NULL,
      "structureId" int4 NOT NULL,
      "action" text NOT NULL,
      CONSTRAINT "PK_69f8faf72fa4038748e4e3f3fbe" PRIMARY KEY (uuid)
    );


    -- public.message_email definition

    -- Drop table

    -- DROP TABLE message_email;

    CREATE UNLOGGED TABLE message_email (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      status text NOT NULL,
      "emailId" text NOT NULL,
      "initialScheduledDate" timestamptz NOT NULL,
      "nextScheduledDate" timestamptz NOT NULL,
      "sendDate" timestamptz NULL,
      "content" jsonb NOT NULL,
      "errorCount" int4 NOT NULL DEFAULT 0,
      "errorMessage" text NULL,
      "sendDetails" jsonb NULL,
      attachments bytea NULL,
      CONSTRAINT "PK_6bffd9b803b67cd4e099fc795e1" PRIMARY KEY (uuid)
    );


    -- public.message_sms definition

    -- Drop table

    -- DROP TABLE message_sms;

    CREATE UNLOGGED TABLE message_sms (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      "usagerRef" int4 NOT NULL,
      "structureId" int4 NOT NULL,
      "content" text NOT NULL,
      status text NOT NULL DEFAULT 'TO_SEND'::text,
      "smsId" text NOT NULL,
      "scheduledDate" timestamptz NOT NULL,
      "sendDate" timestamptz NULL,
      "interactionMetas" jsonb NULL,
      "reminderMetas" jsonb NULL,
      "statusUpdates" jsonb NULL,
      "lastUpdate" timestamptz NULL,
      "errorCount" int4 NOT NULL DEFAULT 0,
      "errorMessage" text NULL,
      "responseId" text NULL,
      "phoneNumber" text NOT NULL,
      "senderName" text NOT NULL,
      CONSTRAINT "PK_4d9f00a5bf0f7f424985b156043" PRIMARY KEY (uuid)
    );
    CREATE INDEX "IDX_3ff6384b58d9d6c5e66104a3e0" ON public.message_sms USING btree ("usagerRef");
    CREATE INDEX "IDX_7fd081c7b024fd7837e6d1923c" ON public.message_sms USING btree (status);
    CREATE INDEX "IDX_dae89d90feda082fad814da8a4" ON public.message_sms USING btree ("structureId");


    -- public.monitor_batch_process definition

    -- Drop table

    -- DROP TABLE monitor_batch_process;

    CREATE UNLOGGED TABLE monitor_batch_process (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      "processId" text NOT NULL,
      "beginDate" timestamptz NOT NULL,
      "endDate" timestamptz NOT NULL,
      "trigger" text NOT NULL,
      status text NOT NULL,
      details jsonb NULL,
      "errorMessage" text NULL,
      "alertMailSent" bool NOT NULL DEFAULT false,
      CONSTRAINT "PK_f00131d757d1ddf39e70901e372" PRIMARY KEY (uuid)
    );


    -- public."structure" definition

    -- Drop table

    -- DROP TABLE "structure";

    CREATE TABLE "structure" (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      id serial4 NOT NULL,
      adresse text NULL,
      "adresseCourrier" jsonb NULL,
      agrement text NULL,
      capacite int4 NULL,
      "codePostal" text NULL,
      "complementAdresse" text NULL,
      departement text NULL,
      region text NULL,
      email text NULL,
      "hardReset" jsonb NULL,
      "tokenDelete" text NULL,
      "import" bool NOT NULL DEFAULT false,
      "registrationDate" timestamptz NOT NULL,
      "importDate" date NULL,
      "lastLogin" date NULL,
      nom text NULL,
      "options" jsonb NULL,
      phone text NULL,
      responsable jsonb NOT NULL,
      "structureType" text NOT NULL,
      "token" text NULL,
      verified bool NOT NULL DEFAULT false,
      ville text NULL,
      sms jsonb NOT NULL DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false}'::jsonb,
      "portailUsager" jsonb NOT NULL DEFAULT '{"enabledByDomifa": false, "enabledByStructure": false}'::jsonb,
      CONSTRAINT "PK_a92a6b3dd54efb4ab48b2d6e7c1" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_90ac7986e769d602d218075215c" UNIQUE (id)
    );
    CREATE INDEX "IDX_90ac7986e769d602d218075215" ON public.structure USING btree (id);


    -- public.structure_doc definition

    -- Drop table

    -- DROP TABLE structure_doc;

    CREATE UNLOGGED TABLE structure_doc (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      id serial4 NOT NULL,
      "label" text NOT NULL,
      "createdBy" jsonb NOT NULL,
      tags jsonb NULL,
      custom bool NOT NULL DEFAULT false,
      filetype text NOT NULL,
      "structureId" int4 NOT NULL,
      "path" text NOT NULL,
      "customDocType" text NULL,
      "displayInPortailUsager" bool NOT NULL DEFAULT false,
      CONSTRAINT "PK_6d6be27ca865c8ba30b9c862b70" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_b1dfa7ef1934657b38072e749e3" UNIQUE (id),
      CONSTRAINT "FK_d79d466c870df0b58864836899d" FOREIGN KEY ("structureId") REFERENCES "structure"(id)
    );
    CREATE INDEX "IDX_b1dfa7ef1934657b38072e749e" ON public.structure_doc USING btree (id);
    CREATE INDEX "IDX_d79d466c870df0b58864836899" ON public.structure_doc USING btree ("structureId");


    -- public.usager definition

    -- Drop table

    -- DROP TABLE usager;

    CREATE TABLE usager (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      "ref" int4 NOT NULL,
      "customRef" text NOT NULL,
      "structureId" int4 NOT NULL,
      nom text NOT NULL,
      prenom text NOT NULL,
      surnom text NULL,
      sexe text NOT NULL,
      "dateNaissance" timestamptz NOT NULL,
      "villeNaissance" text NOT NULL,
      langue text NULL,
      email text NULL,
      phone text NULL,
      preference jsonb NULL DEFAULT '{"email": false, "phone": false, "phoneNumber": null}'::jsonb,
      "datePremiereDom" timestamptz NULL,
      "typeDom" text NULL DEFAULT 'PREMIERE_DOM'::text,
      decision jsonb NOT NULL,
      historique jsonb NOT NULL,
      "ayantsDroits" jsonb NULL,
      "lastInteraction" jsonb NOT NULL,
      docs jsonb NOT NULL DEFAULT '[]'::jsonb,
      "docsPath" jsonb NOT NULL DEFAULT '[]'::jsonb,
      "etapeDemande" int4 NOT NULL DEFAULT 0,
      rdv jsonb NULL,
      entretien jsonb NOT NULL,
      "options" jsonb NOT NULL,
      "import" jsonb NULL,
      notes jsonb NOT NULL DEFAULT '[]'::jsonb,
      CONSTRAINT "PK_1bb36e24229bec446a281573612" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_e76056fb098740de66d58a5055a" UNIQUE ("structureId", ref),
      CONSTRAINT "FK_a44d882d224e368efdee8eb8c80" FOREIGN KEY ("structureId") REFERENCES "structure"(id)
    );
    CREATE INDEX "IDX_8198a25ae40584a38bce1dd4d2" ON public.usager USING btree (ref);
    CREATE INDEX "IDX_a44d882d224e368efdee8eb8c8" ON public.usager USING btree ("structureId");


    -- public.usager_history definition

    -- Drop table

    -- DROP TABLE usager_history;

    CREATE UNLOGGED TABLE usager_history (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      "usagerUUID" uuid NOT NULL,
      "usagerRef" int4 NOT NULL,
      "structureId" int4 NOT NULL,
      "import" jsonb NULL,
      states jsonb NOT NULL,
      CONSTRAINT "PK_29638b771d16000882db14bab40" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_29a873927e96c4290d288d594f4" UNIQUE ("structureId", "usagerRef"),
      CONSTRAINT "UQ_7356ee08f3ac6e3e1c6fe08bd81" UNIQUE ("usagerUUID"),
      CONSTRAINT "FK_36a2e869faca3bb31cbacdf81ba" FOREIGN KEY ("structureId") REFERENCES "structure"(id),
      CONSTRAINT "FK_7356ee08f3ac6e3e1c6fe08bd81" FOREIGN KEY ("usagerUUID") REFERENCES usager(uuid)
    );
    CREATE INDEX "IDX_36a2e869faca3bb31cbacdf81b" ON public.usager_history USING btree ("structureId");
    CREATE INDEX "IDX_7356ee08f3ac6e3e1c6fe08bd8" ON public.usager_history USING btree ("usagerUUID");


    -- public.user_structure definition

    -- Drop table

    -- DROP TABLE user_structure;

    CREATE TABLE user_structure (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      email text NOT NULL,
      fonction text NULL,
      id serial4 NOT NULL,
      "lastLogin" timestamptz NULL,
      nom text NOT NULL,
      "password" text NOT NULL,
      prenom text NOT NULL,
      "role" text NOT NULL DEFAULT 'simple'::text,
      "structureId" int4 NOT NULL,
      mails jsonb NOT NULL DEFAULT '{"guide": false, "import": false}'::jsonb,
      "passwordLastUpdate" timestamptz NULL,
      verified bool NOT NULL DEFAULT true,
      CONSTRAINT "PK_a58dc229068f494a0360b170322" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_22a5c4a3d9b2fb8e4e73fc4ada1" UNIQUE (id),
      CONSTRAINT "UQ_3fa909d0e37c531ebc237703391" UNIQUE (email),
      CONSTRAINT "FK_a52dec7d55b4a81a0af01361485" FOREIGN KEY ("structureId") REFERENCES "structure"(id)
    );
    CREATE INDEX "IDX_74b1b39487db0e5d3471b370cf" ON public.user_structure USING btree (id);
    CREATE INDEX "IDX_a52dec7d55b4a81a0af0136148" ON public.user_structure USING btree ("structureId");
    CREATE INDEX "IDX_e2828c51dc4d023377f256c980" ON public.user_structure USING btree (email);


    -- public.user_structure_security definition

    -- Drop table

    -- DROP TABLE user_structure_security;

    CREATE UNLOGGED TABLE user_structure_security (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      "userId" int4 NOT NULL,
      "structureId" int4 NOT NULL,
      "temporaryTokens" jsonb NULL,
      "eventsHistory" jsonb NOT NULL DEFAULT '[]'::jsonb,
      CONSTRAINT "PK_a617f0127221193d06271877ae0" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_cec1c2a0820383d2a4045b5f902" UNIQUE ("userId"),
      CONSTRAINT "FK_0389a8aa8e69b2d17210745d040" FOREIGN KEY ("userId") REFERENCES user_structure(id),
      CONSTRAINT "FK_57be1bdd772eb3fea1e201317e6" FOREIGN KEY ("structureId") REFERENCES "structure"(id)
    );
    CREATE INDEX "IDX_0389a8aa8e69b2d17210745d04" ON public.user_structure_security USING btree ("userId");
    CREATE INDEX "IDX_57be1bdd772eb3fea1e201317e" ON public.user_structure_security USING btree ("structureId");


    -- public.user_usager definition

    -- Drop table

    -- DROP TABLE user_usager;

    CREATE UNLOGGED TABLE user_usager (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      id serial4 NOT NULL,
      "usagerUUID" uuid NOT NULL,
      "structureId" int4 NOT NULL,
      login text NOT NULL,
      "password" text NOT NULL,
      salt text NOT NULL,
      "isTemporaryPassword" bool NOT NULL DEFAULT false,
      "lastLogin" timestamptz NULL,
      "passwordLastUpdate" timestamptz NULL,
      "lastPasswordResetDate" timestamptz NULL,
      "lastPasswordResetStructureUser" jsonb NULL,
      enabled bool NOT NULL DEFAULT false,
      CONSTRAINT "PK_46cd95ba6c330d680e13ce7d932" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_07ddbb376616a6bf4ffdbb2b6d7" UNIQUE ("usagerUUID"),
      CONSTRAINT "UQ_547d83b925177cadc602bc7e221" UNIQUE (id),
      CONSTRAINT "UQ_7d7ff538b491444ce070065252c" UNIQUE (login),
      CONSTRAINT "FK_07ddbb376616a6bf4ffdbb2b6d7" FOREIGN KEY ("usagerUUID") REFERENCES usager(uuid),
      CONSTRAINT "FK_0d31ec098c9d4e0507712b7f77c" FOREIGN KEY ("structureId") REFERENCES "structure"(id)
    );
    CREATE INDEX "IDX_07ddbb376616a6bf4ffdbb2b6d" ON public.user_usager USING btree ("usagerUUID");
    CREATE INDEX "IDX_0d31ec098c9d4e0507712b7f77" ON public.user_usager USING btree ("structureId");
    CREATE INDEX "IDX_547d83b925177cadc602bc7e22" ON public.user_usager USING btree (id);
    CREATE INDEX "IDX_7d7ff538b491444ce070065252" ON public.user_usager USING btree (login);


    -- public.user_usager_security definition

    -- Drop table

    -- DROP TABLE user_usager_security;

    CREATE UNLOGGED TABLE user_usager_security (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      "userId" int4 NOT NULL,
      "structureId" int4 NOT NULL,
      "eventsHistory" jsonb NOT NULL DEFAULT '[]'::jsonb,
      CONSTRAINT "PK_bae071b5eb7273c0b3d82e670d1" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_0b7885e1594c7af3a5b84a4bdb3" UNIQUE ("userId"),
      CONSTRAINT "FK_066d08686fd781a7ea049b115a2" FOREIGN KEY ("structureId") REFERENCES "structure"(id),
      CONSTRAINT "FK_0b7885e1594c7af3a5b84a4bdb3" FOREIGN KEY ("userId") REFERENCES user_usager(id)
    );
    CREATE INDEX "IDX_066d08686fd781a7ea049b115a" ON public.user_usager_security USING btree ("structureId");
    CREATE INDEX "IDX_0b7885e1594c7af3a5b84a4bdb" ON public.user_usager_security USING btree ("userId");


    -- public.interactions definition

    -- Drop table

    -- DROP TABLE interactions;

    CREATE UNLOGGED TABLE interactions (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      "dateInteraction" timestamp NOT NULL,
      "nbCourrier" int4 NOT NULL DEFAULT 0,
      "structureId" int4 NOT NULL,
      "type" text NOT NULL,
      "usagerRef" int4 NOT NULL,
      "userId" int4 NULL,
      "userName" text NOT NULL,
      "content" text NULL,
      "usagerUUID" uuid NOT NULL,
      "event" text NOT NULL DEFAULT 'create'::text,
      "previousValue" jsonb NULL,
      "interactionOutUUID" uuid NULL,
      CONSTRAINT "PK_006113a10247f411c459d62a5b3" PRIMARY KEY (uuid),
      CONSTRAINT "FK_1953f5ad67157bada8774f7e245" FOREIGN KEY ("structureId") REFERENCES "structure"(id),
      CONSTRAINT "FK_495b59d0dd15e43b262f2da8907" FOREIGN KEY ("interactionOutUUID") REFERENCES interactions(uuid),
      CONSTRAINT "FK_f9c3ee379ce68d4acfe4199a335" FOREIGN KEY ("usagerUUID") REFERENCES usager(uuid)
    );
    CREATE INDEX "IDX_0c5d7e9585c77ff002d4072c3c" ON public.interactions USING btree ("usagerRef");
    CREATE INDEX "IDX_1953f5ad67157bada8774f7e24" ON public.interactions USING btree ("structureId");
    CREATE INDEX "IDX_495b59d0dd15e43b262f2da890" ON public.interactions USING btree ("interactionOutUUID");
    CREATE INDEX "IDX_9992157cbe54583ff7002ae4c0" ON public.interactions USING btree ("userId");
    CREATE INDEX "IDX_f9c3ee379ce68d4acfe4199a33" ON public.interactions USING btree ("usagerUUID");
    `
  );
}
