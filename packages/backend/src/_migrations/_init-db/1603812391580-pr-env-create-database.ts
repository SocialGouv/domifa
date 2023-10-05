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
    appLogger.warn("CREATION DB ....");

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "postgis"`);

    await createTables(queryRunner);

    appLogger.warn("CREATION DB : SUCCESS");
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

    CREATE UNLOGGED TABLE public.app_log (
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
    CREATE INDEX "IDX_9643302335674f651c0e867235" ON public.app_log USING btree ("userId");


    -- public.contact_support definition

    -- Drop table

    -- DROP TABLE public.contact_support;

    CREATE UNLOGGED TABLE public.contact_support (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      "userId" int4 NULL,
      "structureId" int4 NULL,
      "content" text NOT NULL,
      status text NOT NULL DEFAULT 'ON_HOLD'::text,
      attachment jsonb NULL,
      email text NOT NULL,
      category text NULL,
      "name" text NOT NULL,
      "comments" text NULL,
      "structureName" text NULL,
      CONSTRAINT "PK_8e4a4781a01061a482fa33e5f5a" PRIMARY KEY (uuid)
    );
    CREATE INDEX "IDX_2dc55096563e5e2a6db3b83c0c" ON public.contact_support USING btree ("userId");
    CREATE INDEX "IDX_d2145fd3e0c677e9f1f9763467" ON public.contact_support USING btree ("structureId");
    CREATE INDEX "IDX_d92188af7573662f6be7199eda" ON public.contact_support USING btree (status);


    -- public.expired_token definition

    -- Drop table

    -- DROP TABLE public.expired_token;

    CREATE UNLOGGED TABLE public.expired_token (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      "userId" int4 NOT NULL,
      "structureId" int4 NOT NULL,
      "token" text NOT NULL,
      "userProfile" text NOT NULL,
      CONSTRAINT "PK_3086dda63f863ce61659708e8e7" PRIMARY KEY (uuid)
    );
    CREATE INDEX "IDX_4252acc4e242ad123a5d7b0625" ON public.expired_token USING btree ("structureId");
    CREATE INDEX "IDX_728480a55bd9e5daa2a89d8de0" ON public.expired_token USING btree ("userId");


    -- public.message_email definition

    -- Drop table

    -- DROP TABLE public.message_email;

    CREATE UNLOGGED TABLE public.message_email (
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
      attachments jsonb NULL,
      CONSTRAINT "PK_6bffd9b803b67cd4e099fc795e1" PRIMARY KEY (uuid)
    );

    -- public.monitor_batch_process definition

    -- Drop table

    -- DROP TABLE public.monitor_batch_process;

    CREATE UNLOGGED TABLE public.monitor_batch_process (
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


    -- public.open_data_places definition

    -- Drop table

    -- DROP TABLE public.open_data_places;

    CREATE UNLOGGED TABLE public.open_data_places (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
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
      "structureId" int4 NULL,
      CONSTRAINT "PK_f80b64cfb42753deacd8bf6d78d" PRIMARY KEY (uuid)
    );
    CREATE INDEX "IDX_0408f9f2c0defbdc5e44f467a3" ON public.open_data_places USING btree (departement);
    CREATE INDEX "IDX_6e030c1cdb3fa54d0d735cdc6b" ON public.open_data_places USING btree (region);
    CREATE INDEX "IDX_d10ac71fca9180b787ef468659" ON public.open_data_places USING btree ("structureId");
    CREATE INDEX "IDX_d85d3252e11effca2f6b652fde" ON public.open_data_places USING btree ("codePostal");


    -- public.spatial_ref_sys definition

    -- Drop table

    -- DROP TABLE public.spatial_ref_sys;

    CREATE UNLOGGED TABLE public.spatial_ref_sys (
      srid int4 NOT NULL,
      auth_name varchar(256) NULL,
      auth_srid int4 NULL,
      srtext varchar(2048) NULL,
      proj4text varchar(2048) NULL,
      CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid),
      CONSTRAINT spatial_ref_sys_srid_check CHECK (((srid > 0) AND (srid <= 998999)))
    );


    -- public."structure" definition

    -- Drop table

    -- DROP TABLE public."structure";

    CREATE UNLOGGED TABLE public."structure" (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
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
      "import" bool NOT NULL DEFAULT false,
      "registrationDate" timestamptz NOT NULL,
      "importDate" date NULL,
      "lastLogin" date NULL,
      nom text NOT NULL,
      "options" jsonb NOT NULL,
      responsable jsonb NOT NULL,
      "structureType" text NOT NULL,
      "token" text NULL,
      verified bool NOT NULL DEFAULT false,
      ville text NULL,
      sms jsonb NOT NULL DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false}'::jsonb,
      "portailUsager" jsonb NOT NULL DEFAULT '{"enabledByDomifa": true, "enabledByStructure": false, "usagerLoginUpdateLastInteraction": false}'::jsonb,
      "timeZone" text NULL,
      telephone jsonb NOT NULL DEFAULT '{"numero": "", "countryCode": "fr"}'::jsonb,
      "acceptTerms" timestamptz NULL,
      "filesUpdated" bool NOT NULL DEFAULT false,
      latitude float8 NULL,
      longitude float8 NULL,
      CONSTRAINT "PK_a92a6b3dd54efb4ab48b2d6e7c1" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_90ac7986e769d602d218075215c" UNIQUE (id),
      CONSTRAINT "UQ_b36e92e49b2a68f8fea64ec8d5b" UNIQUE (email)
    );
    CREATE INDEX "IDX_30c4985e1148ec42ad6122f0ff" ON public.structure USING btree ("structureType");
    CREATE INDEX "IDX_62204f14a6d17cad41d419d150" ON public.structure USING btree ("codePostal");
    CREATE INDEX "IDX_90ac7986e769d602d218075215" ON public.structure USING btree (id);
    CREATE INDEX "IDX_b36e92e49b2a68f8fea64ec8d5" ON public.structure USING btree (email);
    CREATE INDEX "IDX_e848a2cfbd611ec5edc18074e2" ON public.structure USING btree (region);
    CREATE INDEX "IDX_fa4dea9a1ff8deb8fcf47c451e" ON public.structure USING btree (departement);


    -- public.message_sms definition

    -- Drop table

    -- DROP TABLE public.message_sms;

    CREATE UNLOGGED TABLE public.message_sms (
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
      "lastUpdate" timestamptz NULL,
      "errorCount" int4 NOT NULL DEFAULT 0,
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


    -- public.structure_doc definition

    -- Drop table

    -- DROP TABLE public.structure_doc;

    CREATE UNLOGGED TABLE public.structure_doc (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      id serial4 NOT NULL,
      "label" text NOT NULL,
      "createdBy" jsonb NOT NULL,
      custom bool NOT NULL DEFAULT false,
      filetype text NOT NULL,
      "structureId" int4 NOT NULL,
      "path" text NOT NULL,
      "customDocType" text NULL,
      "displayInPortailUsager" bool NOT NULL DEFAULT false,
      CONSTRAINT "PK_6d6be27ca865c8ba30b9c862b70" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_b1dfa7ef1934657b38072e749e3" UNIQUE (id),
      CONSTRAINT "FK_d79d466c870df0b58864836899d" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_b1dfa7ef1934657b38072e749e" ON public.structure_doc USING btree (id);
    CREATE INDEX "IDX_d79d466c870df0b58864836899" ON public.structure_doc USING btree ("structureId");


    -- public.usager definition

    -- Drop table

    -- DROP TABLE public.usager;

    CREATE UNLOGGED TABLE public.usager (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
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
      "typeDom" text NULL DEFAULT 'PREMIERE_DOM'::text,
      decision jsonb NOT NULL,
      historique jsonb NOT NULL,
      "ayantsDroits" jsonb NULL,
      "lastInteraction" jsonb NOT NULL DEFAULT '{"colisIn": "0", "enAttente": "false", "courrierIn": "0", "recommandeIn": "0", "dateInteraction": "NOW()"}'::jsonb,
      "etapeDemande" int4 NOT NULL DEFAULT 0,
      rdv jsonb NULL,
      "options" jsonb NOT NULL DEFAULT '{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}'::jsonb,
      "import" jsonb NULL,
      migrated bool NOT NULL DEFAULT false,
      telephone jsonb NOT NULL DEFAULT '{"numero": "", "countryCode": "fr"}'::jsonb,
      "contactByPhone" bool NULL DEFAULT false,
      "numeroDistribution" text NULL,
      "pinnedNote" jsonb NULL,
      CONSTRAINT "PK_1bb36e24229bec446a281573612" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_e76056fb098740de66d58a5055a" UNIQUE ("structureId", ref),
      CONSTRAINT "FK_a44d882d224e368efdee8eb8c80" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_32f34de1c043658f4843e62218" ON public.usager USING btree ("typeDom");
    CREATE INDEX "IDX_8198a25ae40584a38bce1dd4d2" ON public.usager USING btree (ref);
    CREATE INDEX "IDX_a44d882d224e368efdee8eb8c8" ON public.usager USING btree ("structureId");
    CREATE INDEX "IDX_b4d09870ec6cad2d2d98b7cc3a" ON public.usager USING btree (migrated);
    CREATE INDEX "IDX_d7abcf8875e8a94abf2dcf041e" ON public.usager USING btree ("dateNaissance");
    CREATE INDEX "IDX_fef5654bcc6595d885e57d1474" ON public.usager USING btree (sexe);


    -- public.usager_docs definition

    -- Drop table

    -- DROP TABLE public.usager_docs;

    CREATE UNLOGGED TABLE public.usager_docs (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
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
      CONSTRAINT "FK_08c4299b8abc6b9f548f2aece20" FOREIGN KEY ("usagerUUID") REFERENCES public.usager(uuid) ON DELETE CASCADE,
      CONSTRAINT "FK_b1db67565e53acec53d5f3aa926" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_08c4299b8abc6b9f548f2aece2" ON public.usager_docs USING btree ("usagerUUID");
    CREATE INDEX "IDX_b1db67565e53acec53d5f3aa92" ON public.usager_docs USING btree ("structureId");


    -- public.usager_entretien definition

    -- Drop table

    -- DROP TABLE public.usager_entretien;

    CREATE UNLOGGED TABLE public.usager_entretien (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
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
      CONSTRAINT "PK_1da0e283293a4bb213ffd0ef280" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_5f4220e5a3e6d2ee1c1bb7fd3d2" UNIQUE ("structureId", "usagerRef"),
      CONSTRAINT "UQ_aa19c17fc79f4e4a648643096f9" UNIQUE ("usagerUUID"),
      CONSTRAINT "FK_6193a732dd00abc56e91e92fe48" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE,
      CONSTRAINT "FK_aa19c17fc79f4e4a648643096f9" FOREIGN KEY ("usagerUUID") REFERENCES public.usager(uuid) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_6193a732dd00abc56e91e92fe4" ON public.usager_entretien USING btree ("structureId");
    CREATE INDEX "IDX_aa19c17fc79f4e4a648643096f" ON public.usager_entretien USING btree ("usagerUUID");


    -- public.usager_history definition

    -- Drop table

    -- DROP TABLE public.usager_history;

    CREATE UNLOGGED TABLE public.usager_history (
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
      CONSTRAINT "FK_36a2e869faca3bb31cbacdf81ba" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE,
      CONSTRAINT "FK_7356ee08f3ac6e3e1c6fe08bd81" FOREIGN KEY ("usagerUUID") REFERENCES public.usager(uuid) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_36a2e869faca3bb31cbacdf81b" ON public.usager_history USING btree ("structureId");
    CREATE INDEX "IDX_7356ee08f3ac6e3e1c6fe08bd8" ON public.usager_history USING btree ("usagerUUID");


    -- public.usager_notes definition

    -- Drop table

    -- DROP TABLE public.usager_notes;

    CREATE UNLOGGED TABLE public.usager_notes (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      id serial4 NOT NULL,
      "usagerUUID" uuid NOT NULL,
      "structureId" int4 NOT NULL,
      "usagerRef" int4 NOT NULL,
      message text NOT NULL,
      archived bool NOT NULL DEFAULT false,
      "createdBy" jsonb NULL,
      "archivedBy" jsonb NULL,
      "archivedAt" date NULL,
      pinned bool NOT NULL DEFAULT false,
      CONSTRAINT "PK_11acb926f75642e9dcdd97e5be1" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_5d06e43196df8e4b02ceb16bc9a" UNIQUE (id),
      CONSTRAINT "FK_6ca23b363643ae281d2f1eddf2f" FOREIGN KEY ("usagerUUID") REFERENCES public.usager(uuid) ON DELETE CASCADE,
      CONSTRAINT "FK_e8b75cd4ebe81d288a6ff7d4115" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_5d06e43196df8e4b02ceb16bc9" ON public.usager_notes USING btree (id);
    CREATE INDEX "IDX_6ca23b363643ae281d2f1eddf2" ON public.usager_notes USING btree ("usagerUUID");
    CREATE INDEX "IDX_e8b75cd4ebe81d288a6ff7d411" ON public.usager_notes USING btree ("structureId");


    -- public.usager_options_history definition

    -- Drop table

    -- DROP TABLE public.usager_options_history;

    CREATE UNLOGGED TABLE public.usager_options_history (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
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
      actif bool NOT NULL DEFAULT false,
      "dateDebut" date NULL,
      "dateFin" date NULL,
      "dateNaissance" date NULL,
      CONSTRAINT "PK_429ff2cc277afdc9e1ce5ac8d63" PRIMARY KEY (uuid),
      CONSTRAINT "FK_3cb5af09bf7cd68d7070dbc8966" FOREIGN KEY ("usagerUUID") REFERENCES public.usager(uuid) ON DELETE CASCADE,
      CONSTRAINT "FK_b509fe905bf502e510cda57080a" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_3cb5af09bf7cd68d7070dbc896" ON public.usager_options_history USING btree ("usagerUUID");
    CREATE INDEX "IDX_b509fe905bf502e510cda57080" ON public.usager_options_history USING btree ("structureId");
    CREATE INDEX "IDX_c2fa002e6f45fe1ca6c7f23496" ON public.usager_options_history USING btree ("userId");


    -- public.user_structure definition

    -- Drop table

    -- DROP TABLE public.user_structure;

    CREATE UNLOGGED TABLE public.user_structure (
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
      "acceptTerms" timestamptz NULL,
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

    CREATE UNLOGGED TABLE public.user_structure_security (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      "userId" int4 NOT NULL,
      "structureId" int4 NOT NULL,
      "temporaryTokens" jsonb NULL,
      "eventsHistory" jsonb NOT NULL DEFAULT '[]'::jsonb,
      CONSTRAINT "PK_a617f0127221193d06271877ae0" PRIMARY KEY (uuid),
      CONSTRAINT "FK_0389a8aa8e69b2d17210745d040" FOREIGN KEY ("userId") REFERENCES public.user_structure(id) ON DELETE CASCADE,
      CONSTRAINT "FK_57be1bdd772eb3fea1e201317e6" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_0389a8aa8e69b2d17210745d04" ON public.user_structure_security USING btree ("userId");
    CREATE INDEX "IDX_57be1bdd772eb3fea1e201317e" ON public.user_structure_security USING btree ("structureId");


    -- public.user_usager definition

    -- Drop table

    -- DROP TABLE public.user_usager;

    CREATE UNLOGGED TABLE public.user_usager (
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
      CONSTRAINT "FK_07ddbb376616a6bf4ffdbb2b6d7" FOREIGN KEY ("usagerUUID") REFERENCES public.usager(uuid) ON DELETE CASCADE,
      CONSTRAINT "FK_0d31ec098c9d4e0507712b7f77c" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_07ddbb376616a6bf4ffdbb2b6d" ON public.user_usager USING btree ("usagerUUID");
    CREATE INDEX "IDX_0d31ec098c9d4e0507712b7f77" ON public.user_usager USING btree ("structureId");
    CREATE INDEX "IDX_547d83b925177cadc602bc7e22" ON public.user_usager USING btree (id);
    CREATE INDEX "IDX_7d7ff538b491444ce070065252" ON public.user_usager USING btree (login);


    -- public.user_usager_security definition

    -- Drop table

    -- DROP TABLE public.user_usager_security;

    CREATE UNLOGGED TABLE public.user_usager_security (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      "userId" int4 NOT NULL,
      "structureId" int4 NOT NULL,
      "eventsHistory" jsonb NOT NULL DEFAULT '[]'::jsonb,
      CONSTRAINT "PK_bae071b5eb7273c0b3d82e670d1" PRIMARY KEY (uuid),
      CONSTRAINT "UQ_0b7885e1594c7af3a5b84a4bdb3" UNIQUE ("userId"),
      CONSTRAINT "FK_066d08686fd781a7ea049b115a2" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE,
      CONSTRAINT "FK_0b7885e1594c7af3a5b84a4bdb3" FOREIGN KEY ("userId") REFERENCES public.user_usager(id) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_066d08686fd781a7ea049b115a" ON public.user_usager_security USING btree ("structureId");
    CREATE INDEX "IDX_0b7885e1594c7af3a5b84a4bdb" ON public.user_usager_security USING btree ("userId");


    -- public.interactions definition

    -- Drop table

    -- DROP TABLE public.interactions;

    CREATE UNLOGGED TABLE public.interactions (
      uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "version" int4 NOT NULL,
      "dateInteraction" timestamptz NOT NULL,
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
      CONSTRAINT "FK_1953f5ad67157bada8774f7e245" FOREIGN KEY ("structureId") REFERENCES public."structure"(id) ON DELETE CASCADE,
      CONSTRAINT "FK_495b59d0dd15e43b262f2da8907" FOREIGN KEY ("interactionOutUUID") REFERENCES public.interactions(uuid),
      CONSTRAINT "FK_f9c3ee379ce68d4acfe4199a335" FOREIGN KEY ("usagerUUID") REFERENCES public.usager(uuid) ON DELETE CASCADE
    );
    CREATE INDEX "IDX_0c5d7e9585c77ff002d4072c3c" ON public.interactions USING btree ("usagerRef");
    CREATE INDEX "IDX_1953f5ad67157bada8774f7e24" ON public.interactions USING btree ("structureId");
    CREATE INDEX "IDX_3bc72392a39f586374f0f7d577" ON public.interactions USING btree (event);
    CREATE INDEX "IDX_416154ec3c1e8fe5a96715b855" ON public.interactions USING btree ("nbCourrier");
    CREATE INDEX "IDX_495b59d0dd15e43b262f2da890" ON public.interactions USING btree ("interactionOutUUID");
    CREATE INDEX "IDX_4a2ef430c9c7a9b4a66db96ec7" ON public.interactions USING btree ("dateInteraction");
    CREATE INDEX "IDX_9992157cbe54583ff7002ae4c0" ON public.interactions USING btree ("userId");
    CREATE INDEX "IDX_ef9fade8e5a6dac06ef5031986" ON public.interactions USING btree (type);
    CREATE INDEX "IDX_f9c3ee379ce68d4acfe4199a33" ON public.interactions USING btree ("usagerUUID");
    `
  );
}
