import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../../config";
import { appLogger } from "../../util";

// IMPORTANT: utilisé sur les branches PR pour initialiser la bdd au démarrage du serveur avec une base vide
export class CreateDatabase1603812391580 implements MigrationInterface {
  name = "createDatabaseMigration1603812391580";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      return;
    }
    appLogger.warn("Lancement de la création de la DB");

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "postgis"`);

    await createTables(queryRunner);

    appLogger.warn("Création de la DB réussi");
  }

  public async down(): Promise<void> {
    // pas nécessaire de maintenir le down ici
  }
}

async function createTables(queryRunner: QueryRunner) {
  appLogger.warn("> CREATE UNLOGGED TABLES");

  await queryRunner.query(
    `
    -- public.app_log definition

    -- Drop table

    -- DROP TABLE public.app_log;

    CREATE TABLE public.app_log (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      "userId" int4 NOT NULL,
      "usagerRef" int4 NULL,
      "structureId" int4 NOT NULL,
      "action" text NOT NULL,
      CONSTRAINT "PK_69f8faf72fa4038748e4e3f3fbe" PRIMARY KEY (uuid)
    );
    CREATE INDEX "IDX_9643302335674f651c0e867235" ON public.app_log USING btree ("userId");


    -- public.contact_support definition

    -- Drop table

    -- DROP TABLE public.contact_support;

    CREATE TABLE public.contact_support (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      "userId" int4 NULL,
      "structureId" int4 NULL,
      "content" text NOT NULL,
      status text DEFAULT 'ON_HOLD'::text NOT NULL,
      attachment jsonb NULL,
      email text NOT NULL,
      category text NULL,
      "name" text NOT NULL,
      "comments" text NULL,
      "structureName" text NULL,
      CONSTRAINT "PK_8e4a4781a01061a482fa33e5f5a" PRIMARY KEY (uuid)
    );


    -- public.message_email definition

    -- Drop table

    -- DROP TABLE public.message_email;

    CREATE TABLE public.message_email (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      status text NOT NULL,
      "emailId" text NOT NULL,
      "initialScheduledDate" timestamptz NOT NULL,
      "nextScheduledDate" timestamptz NOT NULL,
      "sendDate" timestamptz NULL,
      "content" jsonb NOT NULL,
      "errorCount" int4 DEFAULT 0 NOT NULL,
      "errorMessage" text NULL,
      "sendDetails" jsonb NULL,
      attachments jsonb NULL,
      CONSTRAINT "PK_6bffd9b803b67cd4e099fc795e1" PRIMARY KEY (uuid)
    );


    -- public.monitor_batch_process definition

    -- Drop table

    -- DROP TABLE public.monitor_batch_process;

    CREATE TABLE public.monitor_batch_process (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      "processId" text NOT NULL,
      "beginDate" timestamptz NOT NULL,
      "endDate" timestamptz NOT NULL,
      "trigger" text NOT NULL,
      status text NOT NULL,
      details jsonb NULL,
      "errorMessage" text NULL,
      "alertMailSent" bool DEFAULT false NOT NULL,
      CONSTRAINT "PK_f00131d757d1ddf39e70901e372" PRIMARY KEY (uuid)
    );


    -- public."structure" definition

    -- Drop table

    -- DROP TABLE public."structure";

    CREATE TABLE public."structure" (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      id serial4 NOT NULL,
      adresse text NOT NULL,
      "adresseCourrier" jsonb NULL,
      agrement text NULL,
      capacite int4 NULL,
      "codePostal" text NULL,
      "complementAdresse" text NULL,
      departement text NOT NULL,
      region text NOT NULL,
      email text NOT NULL,
      "hardReset" jsonb NULL,
      "tokenDelete" text NULL,
      "import" bool DEFAULT false NOT NULL,
      "registrationDate" timestamptz NOT NULL,
      "importDate" date NULL,
      "lastLogin" date NULL,
      nom text NOT NULL,
      "options" jsonb NOT NULL,
      responsable jsonb NOT NULL,
      "structureType" text NOT NULL,
      "token" text NULL,
      verified bool DEFAULT false NOT NULL,
      ville text NULL,
      sms jsonb DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false}'::jsonb NOT NULL,
      "portailUsager" jsonb DEFAULT '{"enabledByDomifa": true, "enabledByStructure": false, "usagerLoginUpdateLastInteraction": false}'::jsonb NOT NULL,
      "timeZone" text NULL,
      telephone jsonb DEFAULT '{"numero": "", "countryCode": "fr"}'::jsonb NOT NULL,
      "acceptTerms" timestamptz NULL,
      "filesUpdated" bool DEFAULT false NOT NULL,
      latitude float8 NULL,
      longitude float8 NULL,
      "organismeType" text NULL,
      "departmentName" text NULL,
      "regionName" text NULL,
      CONSTRAINT "PK_a92a6b3dd54efb4ab48b2d6e7c1" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_90ac7986e769d602d218075215c" UNIQUE (id),
      CONSTRAINT "UQ_b36e92e49b2a68f8fea64ec8d5b" UNIQUE (email)
    );
    CREATE INDEX "IDX_2877f8c3f6cbddc785bf938d0a" ON public.structure USING btree ("regionName");
    CREATE INDEX "IDX_30c4985e1148ec42ad6122f0ff" ON public.structure USING btree ("structureType");
    CREATE INDEX "IDX_62204f14a6d17cad41d419d150" ON public.structure USING btree ("codePostal");
    CREATE INDEX "IDX_90ac7986e769d602d218075215" ON public.structure USING btree (id);
    CREATE INDEX "IDX_b36e92e49b2a68f8fea64ec8d5" ON public.structure USING btree (email);
    CREATE INDEX "IDX_bf49c177bbacd36423531ecc07" ON public.structure USING btree ("departmentName");
    CREATE INDEX "IDX_e848a2cfbd611ec5edc18074e2" ON public.structure USING btree (region);
    CREATE INDEX "IDX_fa4dea9a1ff8deb8fcf47c451e" ON public.structure USING btree (departement);


    -- public.message_sms definition

    -- Drop table

    -- DROP TABLE public.message_sms;

    CREATE TABLE public.message_sms (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      "usagerRef" int4 NOT NULL,
      "structureId" int4 NOT NULL,
      "content" text NOT NULL,
      status text DEFAULT 'TO_SEND'::text NOT NULL,
      "smsId" text NOT NULL,
      "scheduledDate" timestamptz NOT NULL,
      "sendDate" timestamptz NULL,
      "interactionMetas" jsonb NULL,
      "reminderMetas" jsonb NULL,
      "lastUpdate" timestamptz NULL,
      "errorCount" int4 DEFAULT 0 NOT NULL,
      "errorMessage" text NULL,
      "responseId" text NULL,
      "phoneNumber" text NOT NULL,
      "senderName" text NOT NULL,
      CONSTRAINT "PK_4d9f00a5bf0f7f424985b156043" PRIMARY KEY (uuid),
      CONSTRAINT "FK_dae89d90feda082fad814da8a48" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_3ff6384b58d9d6c5e66104a3e0" ON public.message_sms USING btree ("usagerRef");
    CREATE INDEX "IDX_7fd081c7b024fd7837e6d1923c" ON public.message_sms USING btree (status);
    CREATE INDEX "IDX_d9c81cf63a13921c118dfda46b" ON public.message_sms USING btree ("phoneNumber");
    CREATE INDEX "IDX_dae89d90feda082fad814da8a4" ON public.message_sms USING btree ("structureId");


    -- public.open_data_places definition

    -- Drop table

    -- DROP TABLE public.open_data_places;

    CREATE TABLE public.open_data_places (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      nom text NOT NULL,
      adresse text NOT NULL,
      "complementAdresse" text NULL,
      ville text NULL,
      "codePostal" text NULL,
      departement text NOT NULL,
      region text NOT NULL,
      latitude numeric(10, 7) NOT NULL,
      longitude numeric(10, 7) NOT NULL,
      "source" text NOT NULL,
      "uniqueId" text NOT NULL,
      software text NULL,
      mail text NULL,
      "structureType" text NULL,
      "domifaStructureId" int4 NULL,
      "soliguideStructureId" int4 NULL,
      "mssId" text NULL,
      CONSTRAINT "PK_f80b64cfb42753deacd8bf6d78d" PRIMARY KEY (uuid),
      CONSTRAINT "FK_7ee1e7a8d9441eb76ab7b4aa5a3" FOREIGN KEY ("domifaStructureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_0408f9f2c0defbdc5e44f467a3" ON public.open_data_places USING btree (departement);
    CREATE INDEX "IDX_6e030c1cdb3fa54d0d735cdc6b" ON public.open_data_places USING btree (region);
    CREATE INDEX "IDX_7ee1e7a8d9441eb76ab7b4aa5a" ON public.open_data_places USING btree ("domifaStructureId");
    CREATE INDEX "IDX_d85d3252e11effca2f6b652fde" ON public.open_data_places USING btree ("codePostal");


    -- public.structure_doc definition

    -- Drop table

    -- DROP TABLE public.structure_doc;

    CREATE TABLE public.structure_doc (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      id serial4 NOT NULL,
      "label" text NOT NULL,
      "createdBy" jsonb NOT NULL,
      custom bool DEFAULT false NOT NULL,
      filetype text NOT NULL,
      "structureId" int4 NOT NULL,
      "path" text NOT NULL,
      "customDocType" text NULL,
      "displayInPortailUsager" bool DEFAULT false NOT NULL,
      CONSTRAINT "PK_6d6be27ca865c8ba30b9c862b70" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_b1dfa7ef1934657b38072e749e3" UNIQUE (id),
      CONSTRAINT "FK_d79d466c870df0b58864836899d" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_b1dfa7ef1934657b38072e749e" ON public.structure_doc USING btree (id);
    CREATE INDEX "IDX_d79d466c870df0b58864836899" ON public.structure_doc USING btree ("structureId");


    -- public.structure_stats_reporting definition

    -- Drop table

    -- DROP TABLE public.structure_stats_reporting;

    CREATE TABLE public.structure_stats_reporting (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      "waitingList" bool NULL,
      workers numeric(10, 2) NULL,
      volunteers numeric(10, 2) NULL,
      "humanCosts" numeric(10, 2) NULL,
      "totalCosts" numeric(10, 2) NULL,
      "year" int4 NOT NULL,
      "structureId" int4 NOT NULL,
      "completedBy" jsonb NULL,
      "confirmationDate" timestamptz NULL,
      "waitingTime" text NULL,
      CONSTRAINT "PK_088645fe9378647c20b38ab935f" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_40a85c161ab5b07607f8a11ce6e" UNIQUE ("structureId", year),
      CONSTRAINT "FK_10d285ee14ee48a53c427207f98" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_10d285ee14ee48a53c427207f9" ON public.structure_stats_reporting USING btree ("structureId");
    CREATE INDEX "IDX_e5bcedcfa5f895f9908832a959" ON public.structure_stats_reporting USING btree (year);


    -- public.usager definition

    -- Drop table

    -- DROP TABLE public.usager;

    CREATE TABLE public.usager (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      "ref" int4 NOT NULL,
      "customRef" text NULL,
      "structureId" int4 NOT NULL,
      nom text NOT NULL,
      prenom text NOT NULL,
      surnom text NULL,
      sexe text NOT NULL,
      "dateNaissance" timestamptz NOT NULL,
      "villeNaissance" text NOT NULL,
      langue text NULL,
      email text NULL,
      "datePremiereDom" timestamptz NULL,
      "typeDom" text DEFAULT 'PREMIERE_DOM'::text NULL,
      decision jsonb NOT NULL,
      historique jsonb NOT NULL,
      "ayantsDroits" jsonb NULL,
      "lastInteraction" jsonb NOT NULL,
      "etapeDemande" int4 DEFAULT 0 NOT NULL,
      rdv jsonb NULL,
      "options" jsonb NOT NULL,
      "import" jsonb NULL,
      migrated bool DEFAULT false NOT NULL,
      telephone jsonb NOT NULL,
      "contactByPhone" bool DEFAULT false NULL,
      "numeroDistribution" text NULL,
      "pinnedNote" jsonb NULL,
      nationalite text NULL,
      CONSTRAINT "PK_1bb36e24229bec446a281573612" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_e76056fb098740de66d58a5055a" UNIQUE ("structureId", ref),
      CONSTRAINT "FK_a44d882d224e368efdee8eb8c80" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_a44d882d224e368efdee8eb8c8" ON public.usager USING btree ("structureId");
    CREATE INDEX "IDX_b4d09870ec6cad2d2d98b7cc3a" ON public.usager USING btree (migrated);


    -- public.usager_docs definition

    -- Drop table

    -- DROP TABLE public.usager_docs;

    CREATE TABLE public.usager_docs (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      "usagerUUID" uuid NOT NULL,
      "structureId" int4 NOT NULL,
      "usagerRef" int4 NOT NULL,
      "path" text NOT NULL,
      "label" text NOT NULL,
      filetype text NOT NULL,
      "createdBy" text NOT NULL,
      "encryptionContext" text NULL,
      "encryptionVersion" int4 NULL,
      CONSTRAINT "PK_e7bb21f7a22254259ca123c5caa" PRIMARY KEY (uuid),
      CONSTRAINT "FK_08c4299b8abc6b9f548f2aece20" FOREIGN KEY ("usagerUUID") REFERENCES public.usager("uuid") ON DELETE CASCADE,
      CONSTRAINT "FK_b1db67565e53acec53d5f3aa926" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_08c4299b8abc6b9f548f2aece2" ON public.usager_docs USING btree ("usagerUUID");
    CREATE INDEX "IDX_b1db67565e53acec53d5f3aa92" ON public.usager_docs USING btree ("structureId");


    -- public.usager_entretien definition

    -- Drop table

    -- DROP TABLE public.usager_entretien;

    CREATE TABLE public.usager_entretien (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      "usagerUUID" uuid NOT NULL,
      "structureId" int4 NOT NULL,
      "usagerRef" int4 NOT NULL,
      domiciliation bool NULL,
      commentaires text NULL,
      "typeMenage" text NULL,
      revenus bool NULL,
      "revenusDetail" text NULL,
      orientation bool NULL,
      "orientationDetail" text NULL,
      liencommune text NULL,
      "liencommuneDetail" text NULL,
      residence text NULL,
      "residenceDetail" text NULL,
      cause text NULL,
      "causeDetail" text NULL,
      rattachement text NULL,
      raison text NULL,
      "raisonDetail" text NULL,
      accompagnement bool NULL,
      "accompagnementDetail" text NULL,
      "situationPro" text NULL,
      "situationProDetail" text NULL,
      CONSTRAINT "PK_1da0e283293a4bb213ffd0ef280" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_5f4220e5a3e6d2ee1c1bb7fd3d2" UNIQUE ("structureId", "usagerRef"),
      CONSTRAINT "UQ_aa19c17fc79f4e4a648643096f9" UNIQUE ("usagerUUID"),
      CONSTRAINT "FK_6193a732dd00abc56e91e92fe48" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE,
      CONSTRAINT "FK_aa19c17fc79f4e4a648643096f9" FOREIGN KEY ("usagerUUID") REFERENCES public.usager("uuid") ON DELETE CASCADE
    );
    CREATE INDEX "IDX_6193a732dd00abc56e91e92fe4" ON public.usager_entretien USING btree ("structureId");
    CREATE INDEX "IDX_aa19c17fc79f4e4a648643096f" ON public.usager_entretien USING btree ("usagerUUID");


    -- public.usager_history_states definition

    -- Drop table

    -- DROP TABLE public.usager_history_states;

    CREATE TABLE public.usager_history_states (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      "usagerUUID" uuid NOT NULL,
      "structureId" int4 NOT NULL,
      "ayantsDroits" jsonb NOT NULL,
      decision jsonb NOT NULL,
      entretien jsonb NOT NULL,
      rdv jsonb NULL,
      "createdEvent" text NOT NULL,
      "historyBeginDate" timestamptz NOT NULL,
      "historyEndDate" timestamptz NULL,
      "isActive" bool DEFAULT false NULL,
      "typeDom" text DEFAULT 'PREMIERE_DOM'::text NULL,
      nationalite text NULL,
      sexe text NULL,
      "dateNaissance" timestamptz NULL,
      CONSTRAINT "PK_c1bd0d42891df5715d2ef8474d7" PRIMARY KEY (uuid),
      CONSTRAINT "FK_85ac9012f78c974fb73a5352dfe" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE,
      CONSTRAINT "FK_e819c8b113a23a4a0c13a741da0" FOREIGN KEY ("usagerUUID") REFERENCES public.usager("uuid") ON DELETE CASCADE
    );
    CREATE INDEX "IDX_7ed0bb63b8fc294757b8bd8854" ON public.usager_history_states USING btree ("historyEndDate");
    CREATE INDEX "IDX_85ac9012f78c974fb73a5352df" ON public.usager_history_states USING btree ("structureId");
    CREATE INDEX "IDX_9beb1346c63a45ba7c15db9ee7" ON public.usager_history_states USING btree ("historyBeginDate");
    CREATE INDEX "IDX_e819c8b113a23a4a0c13a741da" ON public.usager_history_states USING btree ("usagerUUID");
    CREATE INDEX idx_stats_range ON public.usager_history_states USING btree ("historyBeginDate", "historyEndDate", "isActive");


    -- public.usager_notes definition

    -- Drop table

    -- DROP TABLE public.usager_notes;

    CREATE TABLE public.usager_notes (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      id serial4 NOT NULL,
      "usagerUUID" uuid NOT NULL,
      "structureId" int4 NOT NULL,
      "usagerRef" int4 NOT NULL,
      message text NOT NULL,
      archived bool DEFAULT false NOT NULL,
      "createdBy" jsonb NULL,
      "archivedBy" jsonb NULL,
      "archivedAt" date NULL,
      pinned bool DEFAULT false NOT NULL,
      CONSTRAINT "PK_11acb926f75642e9dcdd97e5be1" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_5d06e43196df8e4b02ceb16bc9a" UNIQUE (id),
      CONSTRAINT "FK_6ca23b363643ae281d2f1eddf2f" FOREIGN KEY ("usagerUUID") REFERENCES public.usager("uuid") ON DELETE CASCADE,
      CONSTRAINT "FK_e8b75cd4ebe81d288a6ff7d4115" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_5d06e43196df8e4b02ceb16bc9" ON public.usager_notes USING btree (id);
    CREATE INDEX "IDX_6ca23b363643ae281d2f1eddf2" ON public.usager_notes USING btree ("usagerUUID");
    CREATE INDEX "IDX_e8b75cd4ebe81d288a6ff7d411" ON public.usager_notes USING btree ("structureId");


    -- public.usager_options_history definition

    -- Drop table

    -- DROP TABLE public.usager_options_history;

    CREATE TABLE public.usager_options_history (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      "usagerUUID" uuid NOT NULL,
      "userId" int4 NULL,
      "userName" text NULL,
      "structureId" int4 NOT NULL,
      "action" text NOT NULL,
      "type" text NOT NULL,
      nom text NULL,
      prenom text NULL,
      adresse text NULL,
      actif bool DEFAULT false NOT NULL,
      "dateDebut" date NULL,
      "dateFin" date NULL,
      "dateNaissance" date NULL,
      CONSTRAINT "PK_429ff2cc277afdc9e1ce5ac8d63" PRIMARY KEY (uuid),
      CONSTRAINT "FK_3cb5af09bf7cd68d7070dbc8966" FOREIGN KEY ("usagerUUID") REFERENCES public.usager("uuid") ON DELETE CASCADE,
      CONSTRAINT "FK_b509fe905bf502e510cda57080a" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_3cb5af09bf7cd68d7070dbc896" ON public.usager_options_history USING btree ("usagerUUID");
    CREATE INDEX "IDX_b509fe905bf502e510cda57080" ON public.usager_options_history USING btree ("structureId");
    CREATE INDEX "IDX_c2fa002e6f45fe1ca6c7f23496" ON public.usager_options_history USING btree ("userId");


    -- public.user_structure definition

    -- Drop table

    -- DROP TABLE public.user_structure;

    CREATE TABLE public.user_structure (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      email text NOT NULL,
      fonction text NULL,
      id serial4 NOT NULL,
      "lastLogin" timestamptz NULL,
      nom text NOT NULL,
      "password" text NOT NULL,
      prenom text NOT NULL,
      "role" text DEFAULT 'simple'::text NOT NULL,
      "structureId" int4 NOT NULL,
      mails jsonb DEFAULT '{"guide": false, "import": false}'::jsonb NOT NULL,
      "passwordLastUpdate" timestamptz NULL,
      verified bool DEFAULT true NOT NULL,
      "acceptTerms" timestamptz NULL,
      territories text NULL,
      "userRightStatus" text DEFAULT 'structure'::text NOT NULL,
      CONSTRAINT "PK_a58dc229068f494a0360b170322" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_22a5c4a3d9b2fb8e4e73fc4ada1" UNIQUE (id),
      CONSTRAINT "UQ_3fa909d0e37c531ebc237703391" UNIQUE (email),
      CONSTRAINT "FK_a52dec7d55b4a81a0af01361485" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_74b1b39487db0e5d3471b370cf" ON public.user_structure USING btree (id);
    CREATE INDEX "IDX_a52dec7d55b4a81a0af0136148" ON public.user_structure USING btree ("structureId");
    CREATE INDEX "IDX_e2828c51dc4d023377f256c980" ON public.user_structure USING btree (email);


    -- public.user_structure_security definition

    -- Drop table

    -- DROP TABLE public.user_structure_security;

    CREATE TABLE public.user_structure_security (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      "userId" int4 NOT NULL,
      "structureId" int4 NOT NULL,
      "temporaryTokens" jsonb NULL,
      "eventsHistory" jsonb DEFAULT '[]'::jsonb NOT NULL,
      CONSTRAINT "PK_a617f0127221193d06271877ae0" PRIMARY KEY (uuid),
      CONSTRAINT "FK_0389a8aa8e69b2d17210745d040" FOREIGN KEY ("userId") REFERENCES public.user_structure(id) ON DELETE CASCADE,
      CONSTRAINT "FK_57be1bdd772eb3fea1e201317e6" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_0389a8aa8e69b2d17210745d04" ON public.user_structure_security USING btree ("userId");
    CREATE INDEX "IDX_57be1bdd772eb3fea1e201317e" ON public.user_structure_security USING btree ("structureId");


    -- public.user_usager definition

    -- Drop table

    -- DROP TABLE public.user_usager;

    CREATE TABLE public.user_usager (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      id serial4 NOT NULL,
      "usagerUUID" uuid NOT NULL,
      "structureId" int4 NOT NULL,
      login text NOT NULL,
      "password" text NOT NULL,
      salt text NOT NULL,
      "isTemporaryPassword" bool DEFAULT false NOT NULL,
      "lastLogin" timestamptz NULL,
      "passwordLastUpdate" timestamptz NULL,
      "lastPasswordResetDate" timestamptz NULL,
      "lastPasswordResetStructureUser" jsonb NULL,
      enabled bool DEFAULT false NOT NULL,
      "acceptTerms" timestamptz NULL,
      CONSTRAINT "PK_46cd95ba6c330d680e13ce7d932" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_07ddbb376616a6bf4ffdbb2b6d7" UNIQUE ("usagerUUID"),
      CONSTRAINT "UQ_547d83b925177cadc602bc7e221" UNIQUE (id),
      CONSTRAINT "UQ_7d7ff538b491444ce070065252c" UNIQUE (login),
      CONSTRAINT "FK_07ddbb376616a6bf4ffdbb2b6d7" FOREIGN KEY ("usagerUUID") REFERENCES public.usager("uuid") ON DELETE CASCADE,
      CONSTRAINT "FK_0d31ec098c9d4e0507712b7f77c" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_07ddbb376616a6bf4ffdbb2b6d" ON public.user_usager USING btree ("usagerUUID");
    CREATE INDEX "IDX_0d31ec098c9d4e0507712b7f77" ON public.user_usager USING btree ("structureId");
    CREATE INDEX "IDX_547d83b925177cadc602bc7e22" ON public.user_usager USING btree (id);
    CREATE INDEX "IDX_7d7ff538b491444ce070065252" ON public.user_usager USING btree (login);


    -- public.user_usager_login definition

    -- Drop table

    -- DROP TABLE public.user_usager_login;

    CREATE TABLE public.user_usager_login (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      "usagerUUID" uuid NOT NULL,
      "structureId" int4 NOT NULL,
      CONSTRAINT "PK_cfb7dc4a81d1db054ab5b4d50bf" PRIMARY KEY (uuid),
      CONSTRAINT "FK_4bf76763fec5203f945338a0377" FOREIGN KEY ("usagerUUID") REFERENCES public.usager("uuid") ON DELETE CASCADE,
      CONSTRAINT "FK_8722e56ff917692645abcd29e7c" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_user_usager_login ON public.user_usager_login USING btree ("structureId", "usagerUUID");


    -- public.user_usager_security definition

    -- Drop table

    -- DROP TABLE public.user_usager_security;

    CREATE TABLE public.user_usager_security (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      "userId" int4 NOT NULL,
      "structureId" int4 NOT NULL,
      "eventsHistory" jsonb DEFAULT '[]'::jsonb NOT NULL,
      CONSTRAINT "PK_bae071b5eb7273c0b3d82e670d1" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_0b7885e1594c7af3a5b84a4bdb3" UNIQUE ("userId"),
      CONSTRAINT "FK_066d08686fd781a7ea049b115a2" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE,
      CONSTRAINT "FK_0b7885e1594c7af3a5b84a4bdb3" FOREIGN KEY ("userId") REFERENCES public.user_usager(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_066d08686fd781a7ea049b115a" ON public.user_usager_security USING btree ("structureId");
    CREATE INDEX "IDX_0b7885e1594c7af3a5b84a4bdb" ON public.user_usager_security USING btree ("userId");


    -- public.expired_token definition

    -- Drop table

    -- DROP TABLE public.expired_token;

    CREATE TABLE public.expired_token (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      "userId" int4 NOT NULL,
      "structureId" int4 NOT NULL,
      "token" text NOT NULL,
      "userProfile" text NOT NULL,
      CONSTRAINT "PK_3086dda63f863ce61659708e8e7" PRIMARY KEY (uuid),
      CONSTRAINT "FK_4252acc4e242ad123a5d7b06252" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE,
      CONSTRAINT "FK_728480a55bd9e5daa2a89d8de0f" FOREIGN KEY ("userId") REFERENCES public.user_structure(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_4252acc4e242ad123a5d7b0625" ON public.expired_token USING btree ("structureId");
    CREATE INDEX "IDX_728480a55bd9e5daa2a89d8de0" ON public.expired_token USING btree ("userId");


    -- public.interactions definition

    -- Drop table

    -- DROP TABLE public.interactions;

    CREATE TABLE public.interactions (
      "uuid" uuid DEFAULT uuid_generate_v4() NOT NULL,
      "createdAt" timestamptz DEFAULT now() NOT NULL,
      "updatedAt" timestamptz DEFAULT now() NOT NULL,
      "version" int4 NOT NULL,
      "dateInteraction" timestamptz NOT NULL,
      "nbCourrier" int4 DEFAULT 0 NOT NULL,
      "structureId" int4 NOT NULL,
      "type" text NOT NULL,
      "usagerRef" int4 NOT NULL,
      "userId" int4 NULL,
      "userName" text NOT NULL,
      "content" text NULL,
      "usagerUUID" uuid NOT NULL,
      "interactionOutUUID" uuid NULL,
      procuration bool DEFAULT false NOT NULL,
      "returnToSender" bool DEFAULT false NOT NULL,
      CONSTRAINT "PK_006113a10247f411c459d62a5b3" PRIMARY KEY (uuid),
      CONSTRAINT "FK_1953f5ad67157bada8774f7e245" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE,
      CONSTRAINT "FK_f9c3ee379ce68d4acfe4199a335" FOREIGN KEY ("usagerUUID") REFERENCES public.usager("uuid") ON DELETE CASCADE
    );
    CREATE INDEX "IDX_1953f5ad67157bada8774f7e24" ON public.interactions USING btree ("structureId");
    CREATE INDEX "IDX_495b59d0dd15e43b262f2da890" ON public.interactions USING btree ("interactionOutUUID");
    CREATE INDEX "IDX_4a2ef430c9c7a9b4a66db96ec7" ON public.interactions USING btree ("dateInteraction");
    CREATE INDEX "IDX_ef9fade8e5a6dac06ef5031986" ON public.interactions USING btree (type);
    CREATE INDEX "IDX_f9c3ee379ce68d4acfe4199a33" ON public.interactions USING btree ("usagerUUID");
    CREATE INDEX idx_interactions_date ON public.interactions USING btree ("structureId", "usagerUUID", "dateInteraction");
    CREATE INDEX idx_interactions_type ON public.interactions USING btree ("structureId", "usagerUUID", type);
    `
  );
}
