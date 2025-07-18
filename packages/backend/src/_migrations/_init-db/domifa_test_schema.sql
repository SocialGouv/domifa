CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE TABLE public.app_log (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    "userId" integer NOT NULL,
    "usagerRef" integer,
    "structureId" integer,
    action text NOT NULL,
    role text,
    "createdBy" text
);
CREATE TABLE public.contact_support (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    "userId" integer,
    "structureId" integer,
    content text NOT NULL,
    attachment jsonb,
    email text NOT NULL,
    name text NOT NULL,
    "structureName" text,
    subject text,
    phone text
);
CREATE TABLE public.expired_token (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    "userId" integer NOT NULL,
    "structureId" integer NOT NULL,
    token text NOT NULL,
    "userProfile" text NOT NULL
);
CREATE TABLE public.interactions (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    "dateInteraction" timestamp with time zone NOT NULL,
    "nbCourrier" integer DEFAULT 0 NOT NULL,
    "structureId" integer NOT NULL,
    type text NOT NULL,
    "usagerRef" integer NOT NULL,
    "userId" integer,
    "userName" text NOT NULL,
    content text,
    "usagerUUID" uuid NOT NULL,
    "interactionOutUUID" uuid,
    procuration boolean DEFAULT false NOT NULL,
    "returnToSender" boolean DEFAULT false NOT NULL
);
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
    attachments jsonb
);
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
    "lastUpdate" timestamp with time zone,
    "errorCount" integer DEFAULT 0 NOT NULL,
    "errorMessage" text,
    "responseId" text,
    "phoneNumber" text NOT NULL,
    "senderName" text NOT NULL
);
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
CREATE TABLE public.open_data_cities (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    "regionCode" text,
    region text,
    "departmentCode" text,
    department text,
    city text NOT NULL,
    "cityCode" text NOT NULL,
    "postalCode" text,
    population integer DEFAULT 0,
    areas jsonb,
    "populationSegment" text
);
CREATE TABLE public.open_data_places (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    nom text NOT NULL,
    adresse text NOT NULL,
    "complementAdresse" text,
    ville text,
    "codePostal" text,
    departement text NOT NULL,
    region text NOT NULL,
    latitude numeric(10,7) NOT NULL,
    longitude numeric(10,7) NOT NULL,
    source text NOT NULL,
    software text,
    mail text,
    "structureType" text,
    "domifaStructureId" integer,
    "soliguideStructureId" integer,
    "mssId" text,
    "nbDomicilies" integer,
    "nbDomiciliesDomifa" integer,
    "nbAttestations" integer,
    "nbAttestationsDomifa" integer,
    saturation text,
    "saturationDetails" text,
    "dgcsId" text,
    reseau text,
    "domicilieSegment" text,
    "cityCode" text,
    "populationSegment" text
);
CREATE TABLE public.public_stats_cache (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    key character varying(200) NOT NULL,
    stats jsonb NOT NULL
);
CREATE TABLE public.structure (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    id integer NOT NULL,
    adresse text NOT NULL,
    "adresseCourrier" jsonb,
    agrement text,
    capacite integer,
    "codePostal" text NOT NULL,
    "complementAdresse" text,
    departement text NOT NULL,
    region text NOT NULL,
    email text NOT NULL,
    "hardReset" jsonb,
    "tokenDelete" text,
    import boolean DEFAULT false NOT NULL,
    "registrationDate" timestamp with time zone NOT NULL,
    "importDate" date,
    "lastLogin" date,
    nom text NOT NULL,
    options jsonb NOT NULL,
    responsable jsonb NOT NULL,
    "structureType" text NOT NULL,
    token text,
    verified boolean DEFAULT false NOT NULL,
    ville text NOT NULL,
    sms jsonb DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false}'::jsonb NOT NULL,
    "portailUsager" jsonb DEFAULT '{"enabledByDomifa": true, "enabledByStructure": false, "usagerLoginUpdateLastInteraction": false}'::jsonb NOT NULL,
    "timeZone" text NOT NULL,
    telephone jsonb DEFAULT '{"numero": "", "countryCode": "fr"}'::jsonb NOT NULL,
    "acceptTerms" timestamp with time zone,
    latitude double precision,
    longitude double precision,
    "organismeType" text,
    "departmentName" text,
    "regionName" text,
    reseau text,
    "cityCode" text,
    "domicilieSegment" text,
    "populationSegment" text,
    "registrationData" jsonb,
    siret text
);
CREATE TABLE public.structure_doc (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    id integer NOT NULL,
    label text NOT NULL,
    "createdBy" jsonb NOT NULL,
    custom boolean DEFAULT false NOT NULL,
    filetype text NOT NULL,
    "structureId" integer NOT NULL,
    path text NOT NULL,
    "customDocType" text,
    "displayInPortailUsager" boolean DEFAULT false NOT NULL,
    "encryptionContext" text,
    "encryptionVersion" integer
);
CREATE SEQUENCE public.structure_doc_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.structure_doc_id_seq OWNED BY public.structure_doc.id;
CREATE SEQUENCE public.structure_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.structure_id_seq OWNED BY public.structure.id;
CREATE TABLE public.structure_information (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    title character varying NOT NULL,
    description character varying,
    "isTemporary" boolean DEFAULT false NOT NULL,
    "startDate" timestamp without time zone,
    "endDate" timestamp without time zone,
    type character varying NOT NULL,
    "createdBy" jsonb,
    "structureId" integer NOT NULL
);
CREATE TABLE public.structure_stats_reporting (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    "waitingList" boolean,
    workers numeric(10,2),
    volunteers numeric(10,2),
    "humanCosts" numeric(10,2),
    "totalCosts" numeric(10,2),
    year integer NOT NULL,
    "structureId" integer NOT NULL,
    "completedBy" jsonb,
    "confirmationDate" timestamp with time zone,
    "waitingTime" text
);
CREATE TABLE public.typeorm_metadata (
    type character varying(255),
    schema character varying(255),
    name character varying(255),
    value text
);
CREATE TABLE public.usager (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    ref integer NOT NULL,
    "customRef" text,
    "structureId" integer NOT NULL,
    nom text NOT NULL,
    prenom text NOT NULL,
    surnom text,
    sexe text NOT NULL,
    "dateNaissance" timestamp with time zone NOT NULL,
    "villeNaissance" text NOT NULL,
    langue text,
    email text,
    "datePremiereDom" timestamp with time zone,
    "typeDom" text DEFAULT 'PREMIERE_DOM'::text,
    decision jsonb NOT NULL,
    historique jsonb NOT NULL,
    "ayantsDroits" jsonb,
    "lastInteraction" jsonb NOT NULL,
    "etapeDemande" integer DEFAULT 0 NOT NULL,
    rdv jsonb,
    options jsonb NOT NULL,
    import jsonb,
    migrated boolean DEFAULT false NOT NULL,
    telephone jsonb NOT NULL,
    "contactByPhone" boolean DEFAULT false,
    "numeroDistribution" text,
    "pinnedNote" jsonb,
    nationalite text,
    statut text DEFAULT 'INSTRUCTION'::text NOT NULL,
    nom_prenom_surnom_ref character varying NOT NULL,
    "referrerId" integer
);
CREATE TABLE public.usager_docs (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    "usagerUUID" uuid NOT NULL,
    "structureId" integer NOT NULL,
    "usagerRef" integer NOT NULL,
    path text NOT NULL,
    label text NOT NULL,
    filetype text NOT NULL,
    "createdBy" text NOT NULL,
    "encryptionContext" text,
    "encryptionVersion" integer,
    shared boolean DEFAULT false NOT NULL
);
CREATE TABLE public.usager_entretien (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    "usagerUUID" uuid NOT NULL,
    "structureId" integer NOT NULL,
    "usagerRef" integer NOT NULL,
    domiciliation boolean,
    commentaires text,
    "typeMenage" text,
    revenus boolean,
    "revenusDetail" text,
    orientation boolean,
    "orientationDetail" text,
    liencommune text,
    "liencommuneDetail" text,
    residence text,
    "residenceDetail" text,
    cause text,
    "causeDetail" text,
    rattachement text,
    raison text,
    "raisonDetail" text,
    accompagnement boolean,
    "accompagnementDetail" text,
    "situationPro" text,
    "situationProDetail" text
);
CREATE TABLE public.usager_history_states (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    "usagerUUID" uuid NOT NULL,
    "structureId" integer NOT NULL,
    "ayantsDroits" jsonb NOT NULL,
    decision jsonb NOT NULL,
    entretien jsonb NOT NULL,
    rdv jsonb,
    "createdEvent" text NOT NULL,
    "historyBeginDate" timestamp with time zone NOT NULL,
    "historyEndDate" timestamp with time zone,
    "isActive" boolean DEFAULT false,
    "typeDom" text DEFAULT 'PREMIERE_DOM'::text,
    nationalite text,
    sexe text,
    "dateNaissance" timestamp with time zone
);
CREATE TABLE public.usager_notes (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    id integer NOT NULL,
    "usagerUUID" uuid NOT NULL,
    "structureId" integer NOT NULL,
    "usagerRef" integer NOT NULL,
    message text NOT NULL,
    archived boolean DEFAULT false NOT NULL,
    "createdBy" jsonb,
    "archivedBy" jsonb,
    "archivedAt" date,
    pinned boolean DEFAULT false NOT NULL
);
CREATE SEQUENCE public.usager_notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.usager_notes_id_seq OWNED BY public.usager_notes.id;
CREATE TABLE public.usager_options_history (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    "usagerUUID" uuid NOT NULL,
    "userId" integer,
    "userName" text,
    "structureId" integer NOT NULL,
    action text NOT NULL,
    type text NOT NULL,
    nom text,
    prenom text,
    adresse text,
    actif boolean DEFAULT false NOT NULL,
    "dateDebut" date,
    "dateFin" date,
    "dateNaissance" date
);
CREATE TABLE public.user_structure (
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
    verified boolean DEFAULT true NOT NULL,
    "acceptTerms" timestamp with time zone,
    "fonctionDetail" character varying(255)
);
CREATE SEQUENCE public.user_structure_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.user_structure_id_seq OWNED BY public.user_structure.id;
CREATE TABLE public.user_structure_security (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    "userId" integer NOT NULL,
    "temporaryTokens" jsonb,
    "eventsHistory" jsonb DEFAULT '[]'::jsonb NOT NULL
);
CREATE TABLE public.user_supervisor (
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
    "passwordLastUpdate" timestamp with time zone,
    verified boolean DEFAULT true NOT NULL,
    "acceptTerms" timestamp with time zone,
    territories jsonb DEFAULT '[]'::jsonb NOT NULL,
    role text NOT NULL
);
CREATE SEQUENCE public.user_supervisor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.user_supervisor_id_seq OWNED BY public.user_supervisor.id;
CREATE TABLE public.user_supervisor_security (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    "userId" integer NOT NULL,
    "temporaryTokens" jsonb,
    "eventsHistory" jsonb DEFAULT '[]'::jsonb NOT NULL
);
CREATE TABLE public.user_usager (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    id integer NOT NULL,
    "usagerUUID" uuid NOT NULL,
    "structureId" integer NOT NULL,
    login text NOT NULL,
    password text NOT NULL,
    salt text NOT NULL,
    "isTemporaryPassword" boolean DEFAULT false NOT NULL,
    "lastLogin" timestamp with time zone,
    "passwordLastUpdate" timestamp with time zone,
    "lastPasswordResetDate" timestamp with time zone,
    "lastPasswordResetStructureUser" jsonb,
    enabled boolean DEFAULT false NOT NULL,
    "acceptTerms" timestamp with time zone
);
CREATE SEQUENCE public.user_usager_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.user_usager_id_seq OWNED BY public.user_usager.id;
CREATE TABLE public.user_usager_login (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    "usagerUUID" uuid NOT NULL,
    "structureId" integer NOT NULL
);
CREATE TABLE public.user_usager_security (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    version integer NOT NULL,
    "userId" integer NOT NULL,
    "structureId" integer NOT NULL,
    "eventsHistory" jsonb DEFAULT '[]'::jsonb NOT NULL
);
ALTER TABLE ONLY public.structure ALTER COLUMN id SET DEFAULT nextval('public.structure_id_seq'::regclass);
ALTER TABLE ONLY public.structure_doc ALTER COLUMN id SET DEFAULT nextval('public.structure_doc_id_seq'::regclass);
ALTER TABLE ONLY public.usager_notes ALTER COLUMN id SET DEFAULT nextval('public.usager_notes_id_seq'::regclass);
ALTER TABLE ONLY public.user_structure ALTER COLUMN id SET DEFAULT nextval('public.user_structure_id_seq'::regclass);
ALTER TABLE ONLY public.user_supervisor ALTER COLUMN id SET DEFAULT nextval('public.user_supervisor_id_seq'::regclass);
ALTER TABLE ONLY public.user_usager ALTER COLUMN id SET DEFAULT nextval('public.user_usager_id_seq'::regclass);
ALTER TABLE ONLY public.interactions
    ADD CONSTRAINT "PK_006113a10247f411c459d62a5b3" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.structure_stats_reporting
    ADD CONSTRAINT "PK_088645fe9378647c20b38ab935f" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.usager_notes
    ADD CONSTRAINT "PK_11acb926f75642e9dcdd97e5be1" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.usager
    ADD CONSTRAINT "PK_1bb36e24229bec446a281573612" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.usager_entretien
    ADD CONSTRAINT "PK_1da0e283293a4bb213ffd0ef280" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.expired_token
    ADD CONSTRAINT "PK_3086dda63f863ce61659708e8e7" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.usager_options_history
    ADD CONSTRAINT "PK_429ff2cc277afdc9e1ce5ac8d63" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.user_usager
    ADD CONSTRAINT "PK_46cd95ba6c330d680e13ce7d932" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.message_sms
    ADD CONSTRAINT "PK_4d9f00a5bf0f7f424985b156043" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.app_log
    ADD CONSTRAINT "PK_69f8faf72fa4038748e4e3f3fbe" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.message_email
    ADD CONSTRAINT "PK_6bffd9b803b67cd4e099fc795e1" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.structure_doc
    ADD CONSTRAINT "PK_6d6be27ca865c8ba30b9c862b70" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.public_stats_cache
    ADD CONSTRAINT "PK_891fa81e1045157d39573fb1a64" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.contact_support
    ADD CONSTRAINT "PK_8e4a4781a01061a482fa33e5f5a" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.user_structure
    ADD CONSTRAINT "PK_a58dc229068f494a0360b170322" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.user_structure_security
    ADD CONSTRAINT "PK_a617f0127221193d06271877ae0" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.structure
    ADD CONSTRAINT "PK_a92a6b3dd54efb4ab48b2d6e7c1" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.user_supervisor_security
    ADD CONSTRAINT "PK_afc34ab2b3531b41455a9e016b5" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.structure_information
    ADD CONSTRAINT "PK_b51c75b37769abf1fdf28fc89ef" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.user_usager_security
    ADD CONSTRAINT "PK_bae071b5eb7273c0b3d82e670d1" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.usager_history_states
    ADD CONSTRAINT "PK_c1bd0d42891df5715d2ef8474d7" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.user_usager_login
    ADD CONSTRAINT "PK_cfb7dc4a81d1db054ab5b4d50bf" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.usager_docs
    ADD CONSTRAINT "PK_e7bb21f7a22254259ca123c5caa" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.monitor_batch_process
    ADD CONSTRAINT "PK_f00131d757d1ddf39e70901e372" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.open_data_cities
    ADD CONSTRAINT "PK_f20d1eb20573a7f2922c8a5f9a8" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.open_data_places
    ADD CONSTRAINT "PK_f80b64cfb42753deacd8bf6d78d" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.user_supervisor
    ADD CONSTRAINT "PK_fd859b169ff3833fed4b4769aa4" PRIMARY KEY (uuid);
ALTER TABLE ONLY public.user_usager
    ADD CONSTRAINT "UQ_07ddbb376616a6bf4ffdbb2b6d7" UNIQUE ("usagerUUID");
ALTER TABLE ONLY public.user_usager_security
    ADD CONSTRAINT "UQ_0b7885e1594c7af3a5b84a4bdb3" UNIQUE ("userId");
ALTER TABLE ONLY public.user_structure
    ADD CONSTRAINT "UQ_22a5c4a3d9b2fb8e4e73fc4ada1" UNIQUE (id);
ALTER TABLE ONLY public.user_structure
    ADD CONSTRAINT "UQ_3fa909d0e37c531ebc237703391" UNIQUE (email);
ALTER TABLE ONLY public.structure_stats_reporting
    ADD CONSTRAINT "UQ_40a85c161ab5b07607f8a11ce6e" UNIQUE ("structureId", year);
ALTER TABLE ONLY public.user_usager
    ADD CONSTRAINT "UQ_547d83b925177cadc602bc7e221" UNIQUE (id);
ALTER TABLE ONLY public.usager_notes
    ADD CONSTRAINT "UQ_5d06e43196df8e4b02ceb16bc9a" UNIQUE (id);
ALTER TABLE ONLY public.usager_entretien
    ADD CONSTRAINT "UQ_5f4220e5a3e6d2ee1c1bb7fd3d2" UNIQUE ("structureId", "usagerRef");
ALTER TABLE ONLY public.user_usager
    ADD CONSTRAINT "UQ_7d7ff538b491444ce070065252c" UNIQUE (login);
ALTER TABLE ONLY public.structure
    ADD CONSTRAINT "UQ_90ac7986e769d602d218075215c" UNIQUE (id);
ALTER TABLE ONLY public.usager_entretien
    ADD CONSTRAINT "UQ_aa19c17fc79f4e4a648643096f9" UNIQUE ("usagerUUID");
ALTER TABLE ONLY public.structure_doc
    ADD CONSTRAINT "UQ_b1dfa7ef1934657b38072e749e3" UNIQUE (id);
ALTER TABLE ONLY public.structure
    ADD CONSTRAINT "UQ_b36e92e49b2a68f8fea64ec8d5b" UNIQUE (email);
ALTER TABLE ONLY public.user_supervisor
    ADD CONSTRAINT "UQ_c2d4b5706fc542d95a0bf13869b" UNIQUE (email);
ALTER TABLE ONLY public.usager
    ADD CONSTRAINT "UQ_e76056fb098740de66d58a5055a" UNIQUE ("structureId", ref);
ALTER TABLE ONLY public.user_supervisor
    ADD CONSTRAINT "UQ_eba1b8ef0f72cb0dd4997307145" UNIQUE (id);
CREATE INDEX "IDX_0389a8aa8e69b2d17210745d04" ON public.user_structure_security USING btree ("userId");
CREATE INDEX "IDX_0408f9f2c0defbdc5e44f467a3" ON public.open_data_places USING btree (departement);
CREATE INDEX "IDX_066d08686fd781a7ea049b115a" ON public.user_usager_security USING btree ("structureId");
CREATE INDEX "IDX_07ddbb376616a6bf4ffdbb2b6d" ON public.user_usager USING btree ("usagerUUID");
CREATE INDEX "IDX_08c4299b8abc6b9f548f2aece2" ON public.usager_docs USING btree ("usagerUUID");
CREATE INDEX "IDX_0b7885e1594c7af3a5b84a4bdb" ON public.user_usager_security USING btree ("userId");
CREATE INDEX "IDX_0d31ec098c9d4e0507712b7f77" ON public.user_usager USING btree ("structureId");
CREATE INDEX "IDX_10d285ee14ee48a53c427207f9" ON public.structure_stats_reporting USING btree ("structureId");
CREATE INDEX "IDX_17cd35c9fdcd9ab82015a46b22" ON public.structure_information USING btree ("structureId");
CREATE INDEX "IDX_1953f5ad67157bada8774f7e24" ON public.interactions USING btree ("structureId");
CREATE INDEX "IDX_30c4985e1148ec42ad6122f0ff" ON public.structure USING btree ("structureType");
CREATE INDEX "IDX_3cb5af09bf7cd68d7070dbc896" ON public.usager_options_history USING btree ("usagerUUID");
CREATE INDEX "IDX_3ff6384b58d9d6c5e66104a3e0" ON public.message_sms USING btree ("usagerRef");
CREATE INDEX "IDX_4252acc4e242ad123a5d7b0625" ON public.expired_token USING btree ("structureId");
CREATE INDEX "IDX_495b59d0dd15e43b262f2da890" ON public.interactions USING btree ("interactionOutUUID");
CREATE INDEX "IDX_4a2ef430c9c7a9b4a66db96ec7" ON public.interactions USING btree ("dateInteraction");
CREATE INDEX "IDX_547d83b925177cadc602bc7e22" ON public.user_usager USING btree (id);
CREATE INDEX "IDX_5d06e43196df8e4b02ceb16bc9" ON public.usager_notes USING btree (id);
CREATE INDEX "IDX_6193a732dd00abc56e91e92fe4" ON public.usager_entretien USING btree ("structureId");
CREATE INDEX "IDX_6ca23b363643ae281d2f1eddf2" ON public.usager_notes USING btree ("usagerUUID");
CREATE INDEX "IDX_6e030c1cdb3fa54d0d735cdc6b" ON public.open_data_places USING btree (region);
CREATE INDEX "IDX_728480a55bd9e5daa2a89d8de0" ON public.expired_token USING btree ("userId");
CREATE INDEX "IDX_74b1b39487db0e5d3471b370cf" ON public.user_structure USING btree (id);
CREATE INDEX "IDX_7d7ff538b491444ce070065252" ON public.user_usager USING btree (login);
CREATE INDEX "IDX_7ed0bb63b8fc294757b8bd8854" ON public.usager_history_states USING btree ("historyEndDate");
CREATE INDEX "IDX_7ee1e7a8d9441eb76ab7b4aa5a" ON public.open_data_places USING btree ("domifaStructureId");
CREATE INDEX "IDX_7fd081c7b024fd7837e6d1923c" ON public.message_sms USING btree (status);
CREATE INDEX "IDX_85ac9012f78c974fb73a5352df" ON public.usager_history_states USING btree ("structureId");
CREATE INDEX "IDX_90ac7986e769d602d218075215" ON public.structure USING btree (id);
CREATE INDEX "IDX_94c17da6c8fc82ac679eefd3ec" ON public.user_supervisor_security USING btree ("userId");
CREATE INDEX "IDX_9beb1346c63a45ba7c15db9ee7" ON public.usager_history_states USING btree ("historyBeginDate");
CREATE INDEX "IDX_a44d882d224e368efdee8eb8c8" ON public.usager USING btree ("structureId");
CREATE INDEX "IDX_a52dec7d55b4a81a0af0136148" ON public.user_structure USING btree ("structureId");
CREATE INDEX "IDX_aa19c17fc79f4e4a648643096f" ON public.usager_entretien USING btree ("usagerUUID");
CREATE INDEX "IDX_b1db67565e53acec53d5f3aa92" ON public.usager_docs USING btree ("structureId");
CREATE INDEX "IDX_b1dfa7ef1934657b38072e749e" ON public.structure_doc USING btree (id);
CREATE INDEX "IDX_b36e92e49b2a68f8fea64ec8d5" ON public.structure USING btree (email);
CREATE INDEX "IDX_b4d09870ec6cad2d2d98b7cc3a" ON public.usager USING btree (migrated);
CREATE INDEX "IDX_b509fe905bf502e510cda57080" ON public.usager_options_history USING btree ("structureId");
CREATE INDEX "IDX_c2d4b5706fc542d95a0bf13869" ON public.user_supervisor USING btree (email);
CREATE INDEX "IDX_c72d39c3d5bf0192fa5a2470d9" ON public.expired_token USING btree (token);
CREATE INDEX "IDX_d79d466c870df0b58864836899" ON public.structure_doc USING btree ("structureId");
CREATE INDEX "IDX_d85d3252e11effca2f6b652fde" ON public.open_data_places USING btree ("codePostal");
CREATE INDEX "IDX_d9c81cf63a13921c118dfda46b" ON public.message_sms USING btree ("phoneNumber");
CREATE INDEX "IDX_dae89d90feda082fad814da8a4" ON public.message_sms USING btree ("structureId");
CREATE INDEX "IDX_e2828c51dc4d023377f256c980" ON public.user_structure USING btree (email);
CREATE INDEX "IDX_e5bcedcfa5f895f9908832a959" ON public.structure_stats_reporting USING btree (year);
CREATE INDEX "IDX_e819c8b113a23a4a0c13a741da" ON public.usager_history_states USING btree ("usagerUUID");
CREATE INDEX "IDX_e848a2cfbd611ec5edc18074e2" ON public.structure USING btree (region);
CREATE INDEX "IDX_e8b75cd4ebe81d288a6ff7d411" ON public.usager_notes USING btree ("structureId");
CREATE INDEX "IDX_eba1b8ef0f72cb0dd499730714" ON public.user_supervisor USING btree (id);
CREATE INDEX "IDX_ef9fade8e5a6dac06ef5031986" ON public.interactions USING btree (type);
CREATE INDEX "IDX_f072e2874bd87ecb6da2fbd66e" ON public.usager USING btree (nom_prenom_surnom_ref);
CREATE INDEX "IDX_f9c3ee379ce68d4acfe4199a33" ON public.interactions USING btree ("usagerUUID");
CREATE INDEX "IDX_fa4dea9a1ff8deb8fcf47c451e" ON public.structure USING btree (departement);
CREATE INDEX idx_interactions_date ON public.interactions USING btree ("structureId", "usagerUUID", "dateInteraction");
CREATE INDEX idx_interactions_type ON public.interactions USING btree ("structureId", "usagerUUID", type);
CREATE INDEX idx_stats_range ON public.usager_history_states USING btree ("historyBeginDate", "historyEndDate", "isActive");
CREATE INDEX idx_usager_statut ON public.usager USING btree ("structureId", statut);
CREATE INDEX idx_user_usager_login ON public.user_usager_login USING btree ("structureId", "usagerUUID");
ALTER TABLE ONLY public.user_structure_security
    ADD CONSTRAINT "FK_0389a8aa8e69b2d17210745d040" FOREIGN KEY ("userId") REFERENCES public.user_structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.user_usager_security
    ADD CONSTRAINT "FK_066d08686fd781a7ea049b115a2" FOREIGN KEY ("structureId") REFERENCES public.structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.user_usager
    ADD CONSTRAINT "FK_07ddbb376616a6bf4ffdbb2b6d7" FOREIGN KEY ("usagerUUID") REFERENCES public.usager(uuid) ON DELETE CASCADE;
ALTER TABLE ONLY public.usager_docs
    ADD CONSTRAINT "FK_08c4299b8abc6b9f548f2aece20" FOREIGN KEY ("usagerUUID") REFERENCES public.usager(uuid) ON DELETE CASCADE;
ALTER TABLE ONLY public.user_usager_security
    ADD CONSTRAINT "FK_0b7885e1594c7af3a5b84a4bdb3" FOREIGN KEY ("userId") REFERENCES public.user_usager(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.user_usager
    ADD CONSTRAINT "FK_0d31ec098c9d4e0507712b7f77c" FOREIGN KEY ("structureId") REFERENCES public.structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.structure_stats_reporting
    ADD CONSTRAINT "FK_10d285ee14ee48a53c427207f98" FOREIGN KEY ("structureId") REFERENCES public.structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.structure_information
    ADD CONSTRAINT "FK_17cd35c9fdcd9ab82015a46b22c" FOREIGN KEY ("structureId") REFERENCES public.structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.interactions
    ADD CONSTRAINT "FK_1953f5ad67157bada8774f7e245" FOREIGN KEY ("structureId") REFERENCES public.structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.usager_options_history
    ADD CONSTRAINT "FK_3cb5af09bf7cd68d7070dbc8966" FOREIGN KEY ("usagerUUID") REFERENCES public.usager(uuid) ON DELETE CASCADE;
ALTER TABLE ONLY public.expired_token
    ADD CONSTRAINT "FK_4252acc4e242ad123a5d7b06252" FOREIGN KEY ("structureId") REFERENCES public.structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.user_usager_login
    ADD CONSTRAINT "FK_4bf76763fec5203f945338a0377" FOREIGN KEY ("usagerUUID") REFERENCES public.usager(uuid) ON DELETE CASCADE;
ALTER TABLE ONLY public.usager_entretien
    ADD CONSTRAINT "FK_6193a732dd00abc56e91e92fe48" FOREIGN KEY ("structureId") REFERENCES public.structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.usager_notes
    ADD CONSTRAINT "FK_6ca23b363643ae281d2f1eddf2f" FOREIGN KEY ("usagerUUID") REFERENCES public.usager(uuid) ON DELETE CASCADE;
ALTER TABLE ONLY public.expired_token
    ADD CONSTRAINT "FK_728480a55bd9e5daa2a89d8de0f" FOREIGN KEY ("userId") REFERENCES public.user_structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.open_data_places
    ADD CONSTRAINT "FK_7ee1e7a8d9441eb76ab7b4aa5a3" FOREIGN KEY ("domifaStructureId") REFERENCES public.structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.usager_history_states
    ADD CONSTRAINT "FK_85ac9012f78c974fb73a5352dfe" FOREIGN KEY ("structureId") REFERENCES public.structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.user_usager_login
    ADD CONSTRAINT "FK_8722e56ff917692645abcd29e7c" FOREIGN KEY ("structureId") REFERENCES public.structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.user_supervisor_security
    ADD CONSTRAINT "FK_94c17da6c8fc82ac679eefd3ecb" FOREIGN KEY ("userId") REFERENCES public.user_supervisor(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.usager
    ADD CONSTRAINT "FK_a44d882d224e368efdee8eb8c80" FOREIGN KEY ("structureId") REFERENCES public.structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.user_structure
    ADD CONSTRAINT "FK_a52dec7d55b4a81a0af01361485" FOREIGN KEY ("structureId") REFERENCES public.structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.usager_entretien
    ADD CONSTRAINT "FK_aa19c17fc79f4e4a648643096f9" FOREIGN KEY ("usagerUUID") REFERENCES public.usager(uuid) ON DELETE CASCADE;
ALTER TABLE ONLY public.usager_docs
    ADD CONSTRAINT "FK_b1db67565e53acec53d5f3aa926" FOREIGN KEY ("structureId") REFERENCES public.structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.usager_options_history
    ADD CONSTRAINT "FK_b509fe905bf502e510cda57080a" FOREIGN KEY ("structureId") REFERENCES public.structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.structure_doc
    ADD CONSTRAINT "FK_d79d466c870df0b58864836899d" FOREIGN KEY ("structureId") REFERENCES public.structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.message_sms
    ADD CONSTRAINT "FK_dae89d90feda082fad814da8a48" FOREIGN KEY ("structureId") REFERENCES public.structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.usager_history_states
    ADD CONSTRAINT "FK_e819c8b113a23a4a0c13a741da0" FOREIGN KEY ("usagerUUID") REFERENCES public.usager(uuid) ON DELETE CASCADE;
ALTER TABLE ONLY public.usager_notes
    ADD CONSTRAINT "FK_e8b75cd4ebe81d288a6ff7d4115" FOREIGN KEY ("structureId") REFERENCES public.structure(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.interactions
    ADD CONSTRAINT "FK_f9c3ee379ce68d4acfe4199a335" FOREIGN KEY ("usagerUUID") REFERENCES public.usager(uuid) ON DELETE CASCADE;
