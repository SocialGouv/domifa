-- IMPORTANT: make psql fails in case of error (else error won't be reported by github action)
\set ON_ERROR_STOP true

-- NOTE
-- Pour générer les truncates:
-- SELECT 'TRUNCATE TABLE public.' ||  tablename || ' RESTART IDENTITY CASCADE;' FROM pg_tables WHERE tableowner='domifa_user' and tablename not like 'pg_%' and tablename not like 'sql_%' and tablename <> 'migrations';

TRUNCATE TABLE public.app_log RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.contact_support RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.structure RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.interactions RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.message_email RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.message_sms RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.monitor_batch_process RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.structure_doc RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.usager RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.usager_docs RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.usager_notes RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.usager_entretien RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.usager_history RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.user_structure RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.user_structure_security RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.user_usager RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.user_usager_security RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.usager_options_history RESTART IDENTITY CASCADE;

--
-- PostgreSQL database dump
--

-- Dumped from database version 14.9 (Debian 14.9-1.pgdg110+1)
-- Dumped by pg_dump version 14.9 (Debian 14.9-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: app_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_log (uuid, "createdAt", "updatedAt", version, "userId", "usagerRef", "structureId", action) FROM stdin;
0c8c6826-9da4-45f0-a726-9faf11b01eee	2023-09-05 23:50:23.616466+02	2023-09-05 23:50:23.616466+02	1	1	1	1	SUPPRIMER_PIECE_JOINTE
e8112a58-5cda-42ff-8bf6-6dd1ed92bcff	2023-12-18 17:54:10.818639+01	2023-12-18 17:54:10.818639+01	1	1	7	1	RESET_PASSWORD_PORTAIL
448257b5-f24e-4b59-9955-00590cd8d42f	2023-12-18 17:54:12.343842+01	2023-12-18 17:54:12.343842+01	1	1	7	1	DOWNLOAD_PASSWORD_PORTAIL
\.


--
-- Data for Name: contact_support; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_support (uuid, "createdAt", "updatedAt", version, "userId", "structureId", content, status, attachment, email, category, name, comments, "structureName") FROM stdin;
\.


--
-- Data for Name: expired_token; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expired_token (uuid, "createdAt", "updatedAt", version, "userId", "structureId", token, "userProfile") FROM stdin;
\.


--
-- Data for Name: structure; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.structure (uuid, "createdAt", "updatedAt", version, id, adresse, "adresseCourrier", agrement, capacite, "codePostal", "complementAdresse", departement, region, email, "hardReset", "tokenDelete", import, "registrationDate", "importDate", "lastLogin", nom, options, responsable, "structureType", token, verified, ville, sms, "portailUsager", "timeZone", telephone, "acceptTerms", "filesUpdated", latitude, longitude) FROM stdin;
610966c4-ab91-43c0-88da-483ae23d0af2	2021-02-01 17:12:30.65884+01	2023-09-21 01:07:30.382578+02	10	4	rue de l'import	{"actif": false, "ville": "", "adresse": "", "codePostal": ""}	123	\N	44000		44	52	test.import@yopmail.com	\N	\N	f	2021-02-01 17:12:30.655+01	\N	\N	Structure de Test d'import	{"numeroBoite": false}	{"nom": "Test", "prenom": "Import", "fonction": "Testeur"}	asso		t	Nantes	{"senderName": "STRUCTURE D", "senderDetails": "STRUCTURE D", "enabledByDomifa": true, "enabledByStructure": false}	{"enabledByDomifa": true, "enabledByStructure": false, "usagerLoginUpdateLastInteraction": false}	Europe/Paris	{"numero": "0101010101", "countryCode": "fr"}	\N	f	47.213973	-1.536923
943d3acc-2f9c-4bb4-9419-4194bbdfd624	2022-03-17 17:25:53.666507+01	2023-09-21 01:07:30.533736+02	37	5	24, avenue Louis PASTEUR	{"actif": false, "ville": null, "adresse": null, "codePostal": ""}		\N	97300	\N	973	03	ccas-cayenne@yopmail.com	\N	\N	f	2022-03-17 17:25:53.646+01	\N	2022-03-23	CCAS de Cayenne	{"numeroBoite": false}	{"nom": "Pali", "prenom": "Mauricette", "fonction": "Directrice"}	cias		t	Cayenne	{"senderName": "CCAS DE CAY", "senderDetails": "CCAS DE CAY", "enabledByDomifa": true, "enabledByStructure": false}	{"enabledByDomifa": true, "enabledByStructure": false, "usagerLoginUpdateLastInteraction": false}	America/Cayenne	{"numero": "0101010101", "countryCode": "gf"}	\N	f	4.943454	-52.324458
1d1ed6f0-7674-474a-908b-d0bd8c6389cb	2021-01-26 08:51:53.846157+01	2023-09-21 01:07:30.634994+02	6	3	1 rue du test de l'organise agréé	\N	1234	80	44000	\N	44	52	structure@yopmail.com	{"token": "6V0XR2S", "userId": 3}		t	2020-11-17 14:34:35.821+01	\N	2021-12-06	Organisme agréé de Test	{"numeroBoite": false}	{"nom": "Calvez", "prenom": "Simon", "fonction": "Directeur"}	asso	b8e2e05b767ac984f0f4b8a222062b07268f46265525f98d83e4b518b343	f	Nantes	{"senderName": null, "senderDetails": null, "enabledByDomifa": false, "enabledByStructure": false}	{"enabledByDomifa": true, "enabledByStructure": false, "usagerLoginUpdateLastInteraction": false}	Europe/Paris	{"numero": "0506070809", "countryCode": "fr"}	\N	f	47.218193	-1.561368
e159011b-6648-426d-a772-b3ca4f27a6d5	2021-01-26 08:51:53.846157+01	2023-09-21 01:07:30.718487+02	4	2	2 rue du test	\N	\N	\N	33600	\N	33	75	cias.test@yopmail.com	\N		f	2020-11-17 14:32:21.959+01	\N	2020-11-17	CIAS de Test	{"numeroBoite": false}	{"nom": "Anna", "prenom": "Dupond", "fonction": "PDG"}	cias	b1ca3193633282c675257f1b05771a7605a4aa1c5ba231b3545564bfa33a	f	Pessac	{"senderName": null, "senderDetails": null, "enabledByDomifa": false, "enabledByStructure": false}	{"enabledByDomifa": true, "enabledByStructure": false, "usagerLoginUpdateLastInteraction": false}	Europe/Paris	{"numero": "0102030405", "countryCode": "fr"}	\N	f	44.817602	-0.612957
412f6962-fc6e-4e48-b0a6-a37d6eebbc67	2021-01-26 08:51:53.846157+01	2023-12-18 17:52:44.126503+01	369	1	1 rue de l'océan	\N	\N	\N	92600	\N	92	11	ccas.test@yopmail.com	\N		f	2020-11-17 14:30:23.692+01	\N	2023-12-18	CCAS de Test	{"numeroBoite": false}	{"nom": "Jean", "prenom": "Thomson", "fonction": "PDG"}	ccas	adfbfe24ff6de1f4e7c0011ad05028f5a129ced7f120079d20c4adf21d89	t	Asnieres-sur-seine	{"senderName": "CCAS DE TES", "senderDetails": "CCAS DE TES", "enabledByDomifa": true, "enabledByStructure": false}	{"enabledByDomifa": true, "enabledByStructure": true, "usagerLoginUpdateLastInteraction": false}	Europe/Paris	{"numero": "0602030405", "countryCode": "fr"}	2023-02-14 18:33:51.265+01	f	48.903759	2.283746
\.


--
-- Data for Name: usager; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usager (uuid, "createdAt", "updatedAt", version, ref, "customRef", "structureId", nom, prenom, surnom, sexe, "dateNaissance", "villeNaissance", langue, email, "datePremiereDom", "typeDom", decision, historique, "ayantsDroits", "lastInteraction", "etapeDemande", rdv, options, import, migrated, telephone, "contactByPhone", "numeroDistribution", "pinnedNote") FROM stdin;
e074c416-093a-46fc-ae47-77a3bc111d35	2021-01-27 10:21:49.173276+01	2022-12-19 11:29:56.621829+01	6	3	3	1	Dupont	Fred	fredo	homme	1940-08-07 02:00:00+02	Macon	\N	\N	2019-10-07 20:50:25.552+02	PREMIERE_DOM	{"uuid": "30ababd0-8e2f-4917-9662-9c812d604dda", "motif": "SATURATION", "statut": "REFUS", "userId": 1, "dateFin": "2020-08-09T00:00:00.000Z", "typeDom": "PREMIERE", "userName": "Patrick Roméro", "dateDebut": "2019-09-12T00:00:00.000Z", "orientation": "", "dateDecision": "2019-09-12T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[{"uuid": "30ababd0-8e2f-4917-9662-9c812d604dda", "motif": "SATURATION", "statut": "REFUS", "userId": 1, "dateFin": "2020-08-09T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2019-09-12T00:00:00.000Z", "orientation": null, "dateDecision": "2019-09-12T00:00:00.000Z", "motifDetails": null, "orientationDetails": null}]	[]	{"appel": null, "visite": null, "colisIn": 0, "enAttente": false, "courrierIn": 0, "nbCourrier": 0, "courrierOut": null, "recommandeIn": 0, "recommandeOut": null, "dateInteraction": "2021-01-27T09:21:49.237Z"}	5	\N	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N
97b7e840-0e93-4bf4-ba7d-0a406aa898f2	2019-11-22 11:33:43+01	2022-12-19 11:29:56.621829+01	536	2	63	1	Karamoko	Maurice	\N	homme	1998-08-07 02:00:00+02	Bouaké, Côte d'Ivoire	\N	domicilie2@yopmail.com	2018-01-11 01:00:00+01	RENOUVELLEMENT	{"uuid": "178ad317-0bd1-41e7-ad87-fd371f166310", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2020-02-12T00:00:00.000Z", "typeDom": "RENOUVELLEMENT", "userName": "Patrick Roméro", "dateDebut": "2019-02-12T00:00:00.000Z", "orientation": "", "dateDecision": "2019-02-12T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[{"uuid": "178ad317-0bd1-41e7-ad87-fd371f166310", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2020-02-12T00:00:00.000Z", "typeDom": "RENOUVELLEMENT", "userName": "Patrick Roméro", "dateDebut": "2019-02-12T00:00:00.000Z", "orientation": null, "dateDecision": "2019-02-12T00:00:00.000Z", "motifDetails": null, "orientationDetails": null}]	[{"nom": "Karamoko", "lien": "CONJOINT", "prenom": "Mauricette", "dateNaissance": "1978-12-20T00:00:00.000Z"}]	{"colisIn": 3, "enAttente": true, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2020-12-01T10:00:24.980Z"}	3	\N	{"npai": {"actif": false}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [{"nom": "Milani", "prenom": "Marcel", "dateFin": "2022-06-05T00:00:00.000Z", "dateDebut": "2021-10-01T00:00:00.000Z", "dateNaissance": "1983-03-17T00:00:00.000Z"}], "portailUsagerEnabled": true}	\N	t	{"numero": "0606060606", "countryCode": "FR"}	f	\N	\N
16fe01bb-0c4d-4836-a24a-07d117b47fb9	2021-11-30 15:02:59.193913+01	2022-12-19 11:29:56.621829+01	5	9	9	1	TOMOU	Papah		homme	2001-11-03 01:00:00+01	Paris	\N		\N	PREMIERE_DOM	{"uuid": "c46924e6-fc2a-47d6-955c-8f7cabae70e3", "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-11-30T14:02:59.189Z", "userName": "Patrick Roméro", "dateDecision": "2021-11-30T14:02:59.189Z"}	[{"uuid": "c46924e6-fc2a-47d6-955c-8f7cabae70e3", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-11-30T14:02:59.189Z", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-11-30T14:02:59.189Z", "motifDetails": null, "orientationDetails": null}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2021-11-30T14:02:59.187Z"}	2	\N	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N
274427da-7482-4edb-86aa-4afaf48243d5	2021-11-30 15:04:46.21552+01	2022-12-19 11:29:56.621829+01	9	11	11	1	Saura	Sophie		homme	1999-08-20 02:00:00+02	Lyon	\N		\N	PREMIERE_DOM	{"statut": "ATTENTE_DECISION", "userId": 1, "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-11-30T14:04:56.881Z", "dateDecision": "2021-11-30T14:04:56.881Z"}	[{"uuid": "73cb88b5-c4bf-42ee-b6db-2f6f32d4fbc3", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-11-30T14:04:46.214Z", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-11-30T14:04:46.214Z", "motifDetails": null, "orientationDetails": null}, {"motif": null, "statut": "ATTENTE_DECISION", "userId": 1, "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-11-30T14:04:56.881Z", "motifDetails": null, "orientationDetails": null}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2021-11-30T14:04:46.212Z"}	4	{"userId": 1, "dateRdv": "2021-11-30T14:03:48.988Z", "userName": "Patrick Roméro"}	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N
860ffa4c-88c4-4e1c-ad42-5a05cdf39830	2019-11-22 11:33:43+01	2022-12-19 11:29:56.621829+01	9	1	63	1	Ramirez	Marta	\N	femme	1978-08-07 02:00:00+02	Sao Paulo, Brésil	\N	domicilie1@yopmail.com	2018-03-01 01:00:00+01	PREMIERE_DOM	{"uuid": "52ba789e-eb21-4d84-9176-abe1e0d3c778", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2019-02-27T00:00:00.000Z", "typeDom": "PREMIERE", "userName": "Patrick Roméro", "dateDebut": "2018-03-01T00:00:00.000Z", "orientation": "", "dateDecision": "2018-03-01T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[{"uuid": "52ba789e-eb21-4d84-9176-abe1e0d3c778", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2019-02-27T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2018-03-01T00:00:00.000Z", "orientation": null, "dateDecision": "2018-03-01T00:00:00.000Z", "motifDetails": null, "orientationDetails": null}]	[{"nom": "Martinez", "lien": "ENFANT", "prenom": "Luiz", "dateNaissance": "1992-12-20T00:00:00.000Z"}, {"nom": "Martinez", "lien": "ENFANT", "prenom": "Sylvia", "dateNaissance": "2007-10-20T00:00:00.000Z"}]	{"colisIn": 4, "enAttente": true, "courrierIn": 1, "recommandeIn": 3, "dateInteraction": "2020-07-29T11:46:34.680Z"}	5	\N	{"npai": {"actif": false}, "transfert": {"nom": "LHSS Plaisance", "actif": true, "adresse": "12 rue ridder 75014 Paris", "dateFin": "2020-11-07T00:00:00.000Z", "dateDebut": "2020-06-03T12:20:00.603Z"}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "0600000000", "countryCode": "FR"}	f	\N	\N
5215f197-5f9b-4c2a-8b2e-60a0fcc5fc85	2021-06-28 15:26:31.533838+02	2022-12-19 11:29:56.621829+01	9	8	8	1	Smith	John		homme	2000-03-15 01:00:00+01	Londres	\N		\N	PREMIERE_DOM	{"motif": "LIEN_COMMUNE", "statut": "REFUS", "userId": 1, "dateFin": "2021-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-06-28T00:00:00.000Z", "orientation": "asso", "dateDecision": "2021-06-28T13:27:25.493Z", "motifDetails": null, "orientationDetails": "CCAS de sa commune"}	[{"uuid": "6d781a28-a5dc-4d95-826d-6aa0f78e5864", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-06-28T13:26:31.533Z", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-06-28T13:26:31.533Z", "motifDetails": null, "orientationDetails": null}, {"motif": "LIEN_COMMUNE", "statut": "REFUS", "userId": 1, "dateFin": "2021-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-06-28T00:00:00.000Z", "orientation": "asso", "dateDecision": "2021-06-28T13:27:25.493Z", "motifDetails": null, "orientationDetails": "CCAS de sa commune"}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2021-06-28T13:26:31.530Z"}	5	{"userId": 1, "dateRdv": "2021-06-28T13:25:42.151Z", "userName": "Patrick Roméro"}	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N
3ba5c3f0-8003-4c1c-8bf5-929a12e396f5	2021-11-30 15:05:21.635622+01	2022-12-19 11:29:56.621829+01	10	12	12	1	Rara	Dié		homme	1975-08-08 01:00:00+01	Nantes	\N		2021-11-30 01:00:00+01	PREMIERE_DOM	{"motif": "A_SA_DEMANDE", "statut": "RADIE", "userId": 1, "dateFin": "2021-11-30T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-11-30T00:00:00.000Z", "dateDecision": "2021-11-30T14:05:41.678Z", "motifDetails": null}	[{"uuid": "e8e8c681-9151-4335-8e1c-4e9140946b02", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-11-30T14:05:21.634Z", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-11-30T14:05:21.634Z", "motifDetails": null, "orientationDetails": null}, {"motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2022-11-29T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "customRef": "12", "dateDebut": "2021-11-30T00:00:00.000Z", "orientation": null, "dateDecision": "2021-11-30T14:05:31.936Z", "motifDetails": null, "orientationDetails": null}, {"motif": "A_SA_DEMANDE", "statut": "RADIE", "userId": 1, "dateFin": "2021-11-30T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-11-30T00:00:00.000Z", "orientation": null, "dateDecision": "2021-11-30T14:05:41.678Z", "motifDetails": null, "orientationDetails": null}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2021-11-30T14:05:21.631Z"}	5	{"userId": 1, "dateRdv": "2021-11-30T14:04:24.108Z", "userName": "Patrick Roméro"}	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N
6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	2022-03-17 17:34:17.752334+01	2022-12-19 11:29:56.621829+01	78	1	1	5	Salvador	Henri	\N	homme	1960-02-12 01:00:00+01	Cayenne	\N	\N	2022-03-16 20:00:00+01	PREMIERE_DOM	{"statut": "VALIDE", "userId": 11, "dateFin": "2023-03-15T22:59:59.999Z", "typeDom": "PREMIERE_DOM", "userName": "Mauricette Pali", "customRef": "1", "dateDebut": "2022-03-16T19:00:00.000Z", "dateDecision": "2022-03-17T11:34:29.960Z"}	[{"uuid": "db8c8e7d-0300-48e3-a970-10588d410194", "motif": null, "statut": "INSTRUCTION", "userId": 11, "dateFin": "2022-03-17T11:34:17.714Z", "userName": "Mauricette Pali", "dateDebut": "2022-03-17T11:34:17.714Z", "orientation": null, "dateDecision": "2022-03-17T11:34:17.714Z", "motifDetails": null, "orientationDetails": null}, {"motif": null, "statut": "VALIDE", "userId": 11, "dateFin": "2023-03-15T22:59:59.999Z", "typeDom": "PREMIERE_DOM", "userName": "Mauricette Pali", "customRef": "1", "dateDebut": "2022-03-16T19:00:00.000Z", "orientation": null, "dateDecision": "2022-03-17T11:34:29.960Z", "motifDetails": null, "orientationDetails": null}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2020-12-01T05:00:24.980Z"}	5	{"userId": 11, "dateRdv": "2022-03-17T16:33:19.998Z", "userName": "Mauricette Pali"}	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N
427e6af6-706b-40d4-9506-de21190e6f0d	2021-01-27 10:21:49.173276+01	2022-12-19 11:29:56.621829+01	7	4	4	1	Loumiel	Lisa	Lilou	femme	1990-04-18 02:00:00+02	Marseille	\N	\N	2019-08-09 02:00:00+02	PREMIERE_DOM	{"uuid": "0c3f2589-d5d3-4138-a4bc-2a594678461e", "motif": "NON_RESPECT_REGLEMENT", "statut": "RADIE", "userId": 1, "dateFin": "2019-09-12T00:00:00.000Z", "typeDom": "PREMIERE", "userName": "Patrick Roméro", "dateDebut": "2019-08-09T00:00:00.000Z", "orientation": "", "dateDecision": "2019-09-12T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[{"uuid": "0c3f2589-d5d3-4138-a4bc-2a594678461e", "motif": "NON_RESPECT_REGLEMENT", "statut": "RADIE", "userId": 1, "dateFin": "2019-09-12T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2019-08-09T00:00:00.000Z", "orientation": null, "dateDecision": "2019-09-12T00:00:00.000Z", "motifDetails": null, "orientationDetails": null}]	[]	{"appel": null, "visite": null, "colisIn": 0, "enAttente": false, "courrierIn": 0, "nbCourrier": 0, "courrierOut": null, "recommandeIn": 0, "recommandeOut": null, "dateInteraction": "2021-01-27T09:21:49.240Z"}	5	\N	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "0606060606", "countryCode": "FR"}	f	\N	\N
ee7ef219-b101-422c-8ad4-4d5aedf9caad	2020-11-01 18:50:10.047+01	2022-12-19 11:29:56.621829+01	8	6	6	1	NOUVEAU	DOSSIER	TEST	homme	1988-11-02 01:00:00+01	Paris	\N	fake-mail@yopmail.com	2020-11-01 01:00:00+01	PREMIERE_DOM	{"uuid": "bf35d476-35d6-4d3d-93b4-dfd49816904f", "statut": "VALIDE", "userId": 1, "dateFin": "2021-10-31T00:00:00.000Z", "userName": "Patrick Roméro", "dateDebut": "2020-11-01T00:00:00.000Z", "dateDecision": "2020-11-01T17:50:29.003Z", "orientationDetails": null}	[{"uuid": "8bd1eae7-7635-4c75-ba64-ad78b1141baf", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2020-11-01T17:50:10.042Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2020-11-01T17:50:10.042Z", "orientation": null, "dateDecision": "2020-11-01T17:50:10.042Z", "motifDetails": null, "orientationDetails": null}, {"uuid": "bf35d476-35d6-4d3d-93b4-dfd49816904f", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2021-10-31T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2020-11-01T00:00:00.000Z", "orientation": null, "dateDecision": "2020-11-01T17:50:29.003Z", "motifDetails": null, "orientationDetails": null}]	[{"nom": "TEST 1 ", "lien": "PARENT", "prenom": "TEST 2 ", "dateNaissance": "1991-12-20T00:00:00.000Z"}]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2020-11-01T00:00:00.000Z"}	5	{"userId": 1, "dateRdv": "2020-11-01T17:50:12.019Z", "userName": "Roméro Patrick"}	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "0600000000", "countryCode": "FR"}	f	\N	\N
4dcdcddc-fad2-4827-aac5-0acf1df7b5bc	2021-01-27 10:21:49.173276+01	2022-12-19 11:29:56.621829+01	7	5	5	1	Derick	Inspecteur	\N	homme	1911-05-24 00:00:00+00	Bergerac	\N	\N	\N	PREMIERE_DOM	{"uuid": "c6aabd3b-7485-4efd-8c09-5080b91709d9", "statut": "ATTENTE_DECISION", "userId": 2, "dateFin": "2021-01-27T09:21:49.242Z", "userName": "Isabelle Juste", "dateDecision": "2019-10-07T19:28:10.777Z", "orientationDetails": null}	[{"uuid": "6f18c8d5-27b7-45c5-882d-e23876a3b1ed", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2020-10-07T18:52:09.797Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2019-10-07T18:52:09.797Z", "orientation": null, "dateDecision": "2019-10-07T18:53:06.510Z", "motifDetails": null, "orientationDetails": null}, {"uuid": "c6aabd3b-7485-4efd-8c09-5080b91709d9", "motif": null, "statut": "ATTENTE_DECISION", "userId": 2, "dateFin": "2021-01-27T09:21:49.242Z", "typeDom": "PREMIERE_DOM", "userName": "Isabelle Juste", "dateDebut": "2019-10-07T19:28:10.777Z", "orientation": null, "dateDecision": "2019-10-07T19:28:10.777Z", "motifDetails": null, "orientationDetails": null}]	[{"nom": "Inspecteur", "lien": "ENFANT", "prenom": "Gadget", "dateNaissance": "1990-10-12T00:00:00.000Z"}]	{"appel": null, "visite": null, "colisIn": 0, "enAttente": false, "courrierIn": 0, "nbCourrier": 0, "courrierOut": null, "recommandeIn": 0, "recommandeOut": null, "dateInteraction": "2021-01-27T09:21:49.242Z"}	0	{"userId": 2, "dateRdv": "2019-10-07T19:30:02.675Z", "userName": "Juste Isabelle"}	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N
a034b69a-210a-4a3d-b7a9-8987840ef0c7	2021-11-30 15:03:28.817939+01	2023-05-24 17:51:40.763319+02	6	10	10	1	Dupan	Tom		homme	1988-02-02 01:00:00+01	Marseille	\N		\N	PREMIERE_DOM	{"uuid": "fbe59327-0fef-4d74-ade1-97120407f43c", "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-11-30T14:03:28.817Z", "userName": "Patrick Roméro", "dateDecision": "2021-11-30T14:03:28.817Z"}	[{"uuid": "fbe59327-0fef-4d74-ade1-97120407f43c", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-11-30T14:03:28.817Z", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-11-30T14:03:28.817Z", "motifDetails": null, "orientationDetails": null}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2021-11-30T14:03:28.816Z"}	2	\N	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	{"message": "2eme note", "createdAt": "2023-05-24T15:51:38.893Z", "createdBy": {"userId": 1, "userName": "Patrick Roméro"}, "usagerRef": 10}
b2c26e55-ab37-457d-b307-6fe161050a9b	2021-06-28 15:24:22.924091+02	2023-12-18 17:54:10.680396+01	37	7	7	1	Dupont	Pauline	Paula	homme	1996-01-02 01:00:00+01	Paris	fr		2021-06-28 02:00:00+02	PREMIERE_DOM	{"statut": "VALIDE", "userId": 1, "dateFin": "2022-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-06-28T00:00:00.000Z", "dateDecision": "2021-06-28T13:25:20.685Z"}	[{"uuid": "db7ff8b2-66e3-47ee-9346-e080945b418e", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-06-28T13:24:22.920Z", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-06-28T13:24:22.920Z", "motifDetails": null, "orientationDetails": null}, {"motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2022-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-06-28T00:00:00.000Z", "orientation": null, "dateDecision": "2021-06-28T13:25:20.685Z", "motifDetails": null, "orientationDetails": null}]	[{"nom": "Dupont", "lien": "ENFANT", "prenom": "Paulin", "dateNaissance": "2015-08-15T00:00:00.000Z"}, {"nom": "Dupont", "lien": "ENFANT", "prenom": "Sophie", "dateNaissance": "2018-12-03T00:00:00.000Z"}]	{"colisIn": 1, "enAttente": true, "courrierIn": 2, "recommandeIn": 0, "dateInteraction": "2021-06-28T13:25:36.004Z"}	5	{"userId": 1, "dateRdv": "2021-06-28T13:23:27.041Z", "userName": "Patrick Roméro"}	{"npai": {"actif": false}, "transfert": {"actif": false}, "procurations": [], "portailUsagerEnabled": true}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N
\.


--
-- Data for Name: interactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.interactions (uuid, "createdAt", "updatedAt", version, "dateInteraction", "nbCourrier", "structureId", type, "usagerRef", "userId", "userName", content, "usagerUUID", "interactionOutUUID", procuration) FROM stdin;
4fc32424-3f6e-48c7-9ef1-02b9db388445	2020-11-18 12:01:52.072912+01	2020-11-18 12:01:52.072912+01	1	2020-11-01 19:47:00.286+01	3	1	recommandeIn	1	1	Patrick Roméro		860ffa4c-88c4-4e1c-ad42-5a05cdf39830	\N	\N
44ba43d0-ab44-4449-a6e1-40cbcbc92adc	2020-11-18 12:01:52.072912+01	2020-11-18 12:01:52.072912+01	1	2020-11-01 19:47:03.303+01	4	1	colisIn	1	1	Patrick Roméro		860ffa4c-88c4-4e1c-ad42-5a05cdf39830	\N	\N
b174770d-dfb4-45ea-bf5c-58f1288ff6dd	2020-11-18 12:01:52.072912+01	2020-11-18 12:01:52.072912+01	1	2020-11-01 19:47:06.168+01	1	1	courrierIn	1	1	Patrick Roméro		860ffa4c-88c4-4e1c-ad42-5a05cdf39830	\N	\N
f3b49608-cb17-4fdb-b793-8da431cd6ffe	2021-06-28 15:25:35.998265+02	2021-06-28 15:25:35.998265+02	1	2021-06-28 17:25:35.997+02	2	1	courrierOut	7	1	Patrick Roméro	\N	b2c26e55-ab37-457d-b307-6fe161050a9b	\N	\N
53a50f2d-c906-421e-be21-8857dfca97fc	2021-06-28 15:25:36.005054+02	2021-06-28 15:25:36.005054+02	1	2021-06-28 17:25:36.004+02	2	1	colisOut	7	1	Patrick Roméro	\N	b2c26e55-ab37-457d-b307-6fe161050a9b	\N	\N
7d27aea0-d9ae-4529-b1ee-e40a4eadf1ab	2021-06-28 15:25:37.471534+02	2021-06-28 15:25:37.471534+02	1	2021-06-28 17:25:37.47+02	1	1	courrierIn	7	1	Patrick Roméro	\N	b2c26e55-ab37-457d-b307-6fe161050a9b	\N	\N
212f8184-972a-4cb3-ae83-d1738659cbf9	2021-06-28 15:25:45.842905+02	2021-06-28 15:25:45.842905+02	1	2021-06-28 17:25:45.842+02	1	1	courrierIn	7	1	Patrick Roméro	Courrier très important	b2c26e55-ab37-457d-b307-6fe161050a9b	\N	\N
8abd81e6-403f-49f3-999a-0ead3e6456c5	2021-06-28 15:25:51.252592+02	2021-06-28 15:25:51.252592+02	1	2021-06-28 17:25:51.252+02	1	1	colisIn	7	1	Patrick Roméro	\N	b2c26e55-ab37-457d-b307-6fe161050a9b	\N	\N
b68794a5-1d02-48ca-9cc7-8b43b4a4bbf0	2021-06-28 15:25:28.404973+02	2021-12-24 01:46:32.485168+01	2	2021-06-28 17:25:28.404+02	2	1	courrierIn	7	1	Patrick Roméro		b2c26e55-ab37-457d-b307-6fe161050a9b	f3b49608-cb17-4fdb-b793-8da431cd6ffe	\N
fb8dde95-b421-4cf0-b205-9e940d9641e5	2021-06-28 15:25:28.512802+02	2021-12-24 01:46:32.491031+01	2	2021-06-28 17:25:28.512+02	1	1	colisIn	7	1	Patrick Roméro		b2c26e55-ab37-457d-b307-6fe161050a9b	53a50f2d-c906-421e-be21-8857dfca97fc	\N
0a0dbf1d-055f-47db-b2ae-013c611033e8	2021-06-28 15:25:33.70286+02	2021-12-24 01:46:32.491031+01	2	2021-06-28 17:25:33.702+02	1	1	colisIn	7	1	Patrick Roméro	\N	b2c26e55-ab37-457d-b307-6fe161050a9b	53a50f2d-c906-421e-be21-8857dfca97fc	\N
2bbb1a89-c14f-4f32-8928-965dc2565174	2022-03-17 22:40:01.392572+01	2022-03-17 22:40:01.392572+01	1	2020-12-01 06:00:24.98+01	0	5	courrierOut	1	11	Mauricette Pali		6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	\N	\N
eaa91392-fe09-4faa-9bbd-3722b25dd013	2022-03-17 22:39:10.963799+01	2022-03-17 22:39:10.963799+01	1	2020-12-01 06:00:24.98+01	0	5	courrierOut	1	11	Mauricette Pali		6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	\N	\N
03d2f113-726a-4cab-8cee-f111cdbc2c66	2022-03-17 22:40:29.896899+01	2022-03-17 22:40:29.955167+01	3	2020-12-01 11:00:24.98+01	3	1	colisIn	2	1	Patrick Roméro	Colis à donner en urgence	97b7e840-0e93-4bf4-ba7d-0a406aa898f2	\N	\N
bbf70ce8-d4d6-4318-adc6-143af0a06daa	2022-03-17 22:40:30.030609+01	2022-03-17 22:40:30.030609+01	1	2020-12-01 11:00:24.98+01	0	1	visite	2	1	Patrick Roméro	\N	97b7e840-0e93-4bf4-ba7d-0a406aa898f2	\N	\N
efabd6a5-e8d3-464d-a700-f0fd723a43b9	2022-03-17 22:40:30.315091+01	2022-03-17 22:40:30.315091+01	1	2020-12-01 06:00:24.98+01	0	5	courrierOut	1	11	Mauricette Pali		6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	\N	\N
ccfdb5d8-dbb6-4cf8-9818-cd0f4211021e	2022-03-17 22:39:21.729672+01	2022-03-17 22:39:21.729672+01	1	2020-12-01 06:00:24.98+01	0	5	courrierOut	1	11	Mauricette Pali		6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	\N	\N
672bae2a-dfb3-41f3-a3d9-8eda89783612	2022-03-17 22:37:37.935256+01	2022-03-17 22:37:37.935256+01	1	2020-12-01 06:00:24.98+01	0	5	courrierOut	1	11	Mauricette Pali		6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	\N	\N
\.


--
-- Data for Name: message_email; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_email (uuid, "createdAt", "updatedAt", version, status, "emailId", "initialScheduledDate", "nextScheduledDate", "sendDate", content, "errorCount", "errorMessage", "sendDetails", attachments) FROM stdin;
\.


--
-- Data for Name: message_sms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_sms (uuid, "createdAt", "updatedAt", version, "usagerRef", "structureId", content, status, "smsId", "scheduledDate", "sendDate", "interactionMetas", "reminderMetas", "lastUpdate", "errorCount", "errorMessage", "responseId", "phoneNumber", "senderName") FROM stdin;
\.


--
-- Data for Name: monitor_batch_process; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.monitor_batch_process (uuid, "createdAt", "updatedAt", version, "processId", "beginDate", "endDate", trigger, status, details, "errorMessage", "alertMailSent") FROM stdin;
\.


--
-- Data for Name: open_data_places; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.open_data_places (uuid, "createdAt", "updatedAt", version, nom, adresse, "complementAdresse", ville, "codePostal", departement, region, latitude, longitude, source, "uniqueId", software, mail, "structureType", "domifaStructureId", "soliguideStructureId") FROM stdin;
\.


--
-- Data for Name: structure_doc; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.structure_doc (uuid, "createdAt", "updatedAt", version, id, label, "createdBy", custom, filetype, "structureId", path, "customDocType", "displayInPortailUsager") FROM stdin;
\.


--
-- Data for Name: usager_docs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usager_docs (uuid, "createdAt", "updatedAt", version, "usagerUUID", "structureId", "usagerRef", path, label, filetype, "createdBy", "encryptionContext", "encryptionVersion") FROM stdin;
2eb5e74d-4b25-4aa6-ad2a-7d963ae66072	2019-10-07 20:51:31.578+02	2022-06-28 22:52:59.282479+02	1	860ffa4c-88c4-4e1c-ad42-5a05cdf39830	1	1	373144a3d9d0b3f4c84bd527a5cff880.jpg	CNI	image/jpeg	Patrick Roméro	ffe17c48-7a1a-42c9-8494-0b72ca8b3686	0
a77729a9-1b28-4090-bda8-760590bff982	2019-10-07 20:53:32.922+02	2022-06-28 22:52:59.28757+02	1	4dcdcddc-fad2-4827-aac5-0acf1df7b5bc	1	5	8242ba1bc7f3c3971f761b6a347fc1c4.jpg	Carte identité	image/jpeg	Patrick Roméro	ffe17c48-7a1a-42c9-8494-0b72ca8b3686	0
\.


--
-- Data for Name: usager_entretien; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usager_entretien (uuid, "createdAt", "updatedAt", version, "usagerUUID", "structureId", "usagerRef", domiciliation, commentaires, "typeMenage", revenus, "revenusDetail", orientation, "orientationDetail", liencommune, "liencommuneDetail", residence, "residenceDetail", cause, "causeDetail", rattachement, raison, "raisonDetail", accompagnement, "accompagnementDetail", "situationPro") FROM stdin;
b56c7942-55de-4e66-8bc6-7aa046d58d43	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	e074c416-093a-46fc-ae47-77a3bc111d35	1	3	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
a1f75daa-858a-4b99-a370-b8a8b69f0eae	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	97b7e840-0e93-4bf4-ba7d-0a406aa898f2	1	2	t	\N	COUPLE_AVEC_ENFANT	f	\N	t	\N	\N	\N	DOMICILE_MOBILE	\N	ERRANCE	\N	\N	AUTRE	\N	t	\N	\N
e85b1ec0-d972-4ff3-b84c-19c0aa47f774	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	a034b69a-210a-4a3d-b7a9-8987840ef0c7	1	10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
03092425-aeaa-4a28-9818-6d583f712405	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	16fe01bb-0c4d-4836-a24a-07d117b47fb9	1	9	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
54401773-a3dc-4a67-bed9-b34a2e69cac0	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	274427da-7482-4edb-86aa-4afaf48243d5	1	11	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
071a4aa3-ae50-400e-bda0-ce39cb4265eb	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	860ffa4c-88c4-4e1c-ad42-5a05cdf39830	1	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
adeaafb2-c791-42cd-837f-ae592e55d01c	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	5215f197-5f9b-4c2a-8b2e-60a0fcc5fc85	1	8	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
57495291-d7d9-43b8-b6b7-b0fdee610bba	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	3ba5c3f0-8003-4c1c-8bf5-929a12e396f5	1	12	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
65a59363-6dd1-40b3-ab0a-aab25d2504e2	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	b2c26e55-ab37-457d-b307-6fe161050a9b	1	7	t	Ceci est un commentaire sur l'entretien	FEMME_ISOLE_AVEC_ENFANT	f	\N	f	\N	\N	\N	HEBERGEMENT_TIERS	\N	RUPTURE	\N	\N	AUTRE	\N	f	\N	\N
03595273-f06c-4f07-8a7d-161e6c3e53b0	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	5	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	HEBERGE_SANS_ADRESSE	\N	\N	EXERCICE_DROITS	\N	\N	\N	\N
7197d930-e154-4859-b46d-cb63f40fef34	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	427e6af6-706b-40d4-9506-de21190e6f0d	1	4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
43df7440-579e-496e-96e6-fae9d13588f0	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	ee7ef219-b101-422c-8ad4-4d5aedf9caad	1	6	t	\N	FEMME_ISOLE_AVEC_ENFANT	t	\N	f	\N	\N	\N	HEBERGEMENT_TIERS	\N	VIOLENCE	\N	\N	EXERCICE_DROITS	\N	f	\N	\N
2c7d5340-3758-44db-8582-2a217925e3e9	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	4dcdcddc-fad2-4827-aac5-0acf1df7b5bc	1	5	f	\N	\N	f	\N	\N	\N	\N	\N	HEBERGEMENT_TIERS	\N	ERRANCE	\N	\N	\N	\N	t	CCAS des mureaux	\N
\.


--
-- Data for Name: usager_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usager_history (uuid, "createdAt", "updatedAt", version, "usagerUUID", "usagerRef", "structureId", import, states, migrated) FROM stdin;
983a9a4c-960d-4573-942f-b96ad6b1e418	2021-06-15 11:19:07.821605+02	2024-01-09 17:12:53.613519+01	3	e074c416-093a-46fc-ae47-77a3bc111d35	3	1	\N	[{"rdv": {}, "uuid": "b2a50541-a5ae-40b7-8d78-3382f8480f3f", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "30ababd0-8e2f-4917-9662-9c812d604dda", "motif": "SATURATION", "statut": "REFUS", "dateFin": "2020-08-09T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2019-09-12T00:00:00.000Z", "orientation": "", "dateDecision": "2019-09-12T00:00:00.000Z"}, "isActive": false, "createdAt": "2019-09-12T00:00:00.000Z", "entretien": {"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "domiciliation": null, "accompagnement": null}, "ayantsDroits": [], "createdEvent": "new-decision", "historyBeginDate": "2019-09-12T00:00:00.000Z"}]	t
5b4084a3-df01-4eff-87bd-09fcf02ea80b	2021-06-15 11:19:07.821605+02	2024-01-09 17:12:53.613519+01	3	860ffa4c-88c4-4e1c-ad42-5a05cdf39830	1	1	\N	[{"rdv": {}, "uuid": "9e47e6cc-dcec-4023-824d-48af0d0b7539", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "52ba789e-eb21-4d84-9176-abe1e0d3c778", "motif": null, "statut": "VALIDE", "dateFin": "2019-02-27T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2018-03-01T00:00:00.000Z", "orientation": "", "dateDecision": "2018-03-01T00:00:00.000Z"}, "isActive": true, "createdAt": "2018-03-01T00:00:00.000Z", "entretien": {"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "domiciliation": null, "accompagnement": null}, "ayantsDroits": [{"lien": "ENFANT", "dateNaissance": "1992-12-20T00:00:00.000Z"}, {"lien": "ENFANT", "dateNaissance": "2007-10-20T00:00:00.000Z"}], "createdEvent": "new-decision", "historyBeginDate": "2018-03-01T00:00:00.000Z"}]	t
e794c3d3-4af3-4ab1-a284-a0acaa69ca69	2021-06-15 11:19:07.821605+02	2024-01-09 17:12:53.613519+01	3	427e6af6-706b-40d4-9506-de21190e6f0d	4	1	\N	[{"rdv": {}, "uuid": "36aa8ea2-f22b-48c4-8d22-d7d82a70e808", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "0c3f2589-d5d3-4138-a4bc-2a594678461e", "motif": "NON_RESPECT_REGLEMENT", "statut": "RADIE", "dateFin": "2019-09-12T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2019-08-09T00:00:00.000Z", "orientation": "", "dateDecision": "2019-09-12T00:00:00.000Z"}, "isActive": false, "createdAt": "2019-09-12T00:00:00.000Z", "entretien": {"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "domiciliation": null, "accompagnement": null}, "ayantsDroits": [], "createdEvent": "new-decision", "historyBeginDate": "2019-08-09T00:00:00.000Z"}]	t
d1466297-e227-458c-aa70-537bf046f3d3	2021-06-28 15:26:31.539355+02	2024-01-09 17:12:53.613519+01	6	5215f197-5f9b-4c2a-8b2e-60a0fcc5fc85	8	1	\N	[{"rdv": {}, "uuid": "400400ee-c8e6-49b1-9dde-7d615eddccb5", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "6d781a28-a5dc-4d95-826d-6aa0f78e5864", "statut": "INSTRUCTION", "dateFin": "2021-06-28T13:26:31.533Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-06-28T13:26:31.533Z", "dateDecision": "2021-06-28T13:26:31.533Z"}, "isActive": false, "createdAt": "2021-06-28T13:26:31.533Z", "entretien": {}, "ayantsDroits": [], "createdEvent": "new-decision", "etapeDemande": 1, "historyEndDate": "2021-06-27T23:59:59.999Z", "historyBeginDate": "2021-06-28T00:00:00.000Z"}, {"rdv": {"dateRdv": "2021-06-28T13:26:00.000Z"}, "uuid": "86cf984d-0f88-4197-a72a-9fa0951a6db5", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "6d781a28-a5dc-4d95-826d-6aa0f78e5864", "statut": "INSTRUCTION", "dateFin": "2021-06-28T13:26:31.533Z", "dateDecision": "2021-06-28T13:26:31.533Z"}, "isActive": false, "createdAt": "2021-06-28T13:26:39.153Z", "entretien": {}, "ayantsDroits": [], "createdEvent": "update-rdv", "etapeDemande": 1, "historyEndDate": "2021-06-27T23:59:59.999Z", "historyBeginDate": "2021-06-28T00:00:00.000Z"}, {"rdv": {"dateRdv": "2021-06-28T13:25:42.151Z"}, "uuid": "3c3caa75-38ec-40a5-a905-42e881050bf0", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "6d781a28-a5dc-4d95-826d-6aa0f78e5864", "statut": "INSTRUCTION", "dateFin": "2021-06-28T13:26:31.533Z", "dateDecision": "2021-06-28T13:26:31.533Z"}, "isActive": false, "createdAt": "2021-06-28T13:26:42.157Z", "entretien": {}, "ayantsDroits": [], "createdEvent": "update-rdv", "etapeDemande": 2, "historyEndDate": "2021-06-27T23:59:59.999Z", "historyBeginDate": "2021-06-28T00:00:00.000Z"}, {"rdv": {"dateRdv": "2021-06-28T13:25:42.151Z"}, "uuid": "cba01ccb-fc25-494b-b039-b1cc37a3e022", "typeDom": "PREMIERE_DOM", "decision": {"motif": "LIEN_COMMUNE", "statut": "REFUS", "dateFin": "2021-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-06-28T00:00:00.000Z", "orientation": "asso", "dateDecision": "2021-06-28T13:27:25.493Z"}, "isActive": false, "createdAt": "2021-06-28T13:27:25.493Z", "entretien": {}, "ayantsDroits": [], "createdEvent": "new-decision", "etapeDemande": 5, "historyBeginDate": "2021-06-28T00:00:00.000Z"}]	t
258a27af-1ec6-46d6-a44c-14723b40f343	2021-11-30 15:02:59.209996+01	2024-01-09 17:12:53.613519+01	3	16fe01bb-0c4d-4836-a24a-07d117b47fb9	9	1	\N	[{"rdv": {}, "uuid": "3ca87c66-8f4b-40c0-97fa-2c133d830531", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "c46924e6-fc2a-47d6-955c-8f7cabae70e3", "statut": "INSTRUCTION", "dateFin": "2021-11-30T14:02:59.189Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-11-30T14:02:59.189Z", "dateDecision": "2021-11-30T14:02:59.189Z"}, "isActive": false, "createdAt": "2021-11-30T14:02:59.189Z", "entretien": {}, "ayantsDroits": [], "createdEvent": "new-decision", "etapeDemande": 1, "historyBeginDate": "2021-11-30T00:00:00.000Z"}]	t
1d5c32f8-3443-401f-8817-7ee5cc77ba87	2021-11-30 15:03:28.822573+01	2024-01-09 17:12:53.613519+01	3	a034b69a-210a-4a3d-b7a9-8987840ef0c7	10	1	\N	[{"rdv": {}, "uuid": "05c0486c-c1f3-446e-ad52-c3f08b2b0e8d", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "fbe59327-0fef-4d74-ade1-97120407f43c", "statut": "INSTRUCTION", "dateFin": "2021-11-30T14:03:28.817Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-11-30T14:03:28.817Z", "dateDecision": "2021-11-30T14:03:28.817Z"}, "isActive": false, "createdAt": "2021-11-30T14:03:28.817Z", "entretien": {}, "ayantsDroits": [], "createdEvent": "new-decision", "etapeDemande": 1, "historyBeginDate": "2021-11-30T00:00:00.000Z"}]	t
ce011547-6ebc-4770-9375-4fb9bfdf4727	2021-11-30 15:04:46.225029+01	2024-01-09 17:12:53.613519+01	5	274427da-7482-4edb-86aa-4afaf48243d5	11	1	\N	[{"rdv": {}, "uuid": "e34b5628-eae0-4d1c-91e7-9a0b0763f5b4", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "73cb88b5-c4bf-42ee-b6db-2f6f32d4fbc3", "statut": "INSTRUCTION", "dateFin": "2021-11-30T14:04:46.214Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-11-30T14:04:46.214Z", "dateDecision": "2021-11-30T14:04:46.214Z"}, "isActive": false, "createdAt": "2021-11-30T14:04:46.214Z", "entretien": {}, "ayantsDroits": [], "createdEvent": "new-decision", "etapeDemande": 1, "historyEndDate": "2021-11-29T23:59:59.999Z", "historyBeginDate": "2021-11-30T00:00:00.000Z"}, {"rdv": {"dateRdv": "2021-11-30T14:03:48.988Z"}, "uuid": "35bd1e85-af26-441f-9b74-12f0b085351e", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "73cb88b5-c4bf-42ee-b6db-2f6f32d4fbc3", "statut": "INSTRUCTION", "dateFin": "2021-11-30T14:04:46.214Z", "dateDecision": "2021-11-30T14:04:46.214Z"}, "isActive": false, "createdAt": "2021-11-30T14:04:48.993Z", "entretien": {}, "ayantsDroits": [], "createdEvent": "update-rdv", "etapeDemande": 2, "historyEndDate": "2021-11-29T23:59:59.999Z", "historyBeginDate": "2021-11-30T00:00:00.000Z"}, {"rdv": {"dateRdv": "2021-11-30T14:03:48.988Z"}, "uuid": "29bfc4cf-b32f-493f-92d6-002e8346bfba", "typeDom": "PREMIERE_DOM", "decision": {"statut": "ATTENTE_DECISION", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-11-30T14:04:56.881Z", "dateDecision": "2021-11-30T14:04:56.881Z"}, "isActive": false, "createdAt": "2021-11-30T14:04:56.881Z", "entretien": {}, "ayantsDroits": [], "createdEvent": "new-decision", "etapeDemande": 4, "historyBeginDate": "2021-11-30T00:00:00.000Z"}]	t
1d6a7b7c-7f7c-4b12-8841-860c159fc63e	2021-11-30 15:05:21.640877+01	2024-01-09 17:12:53.613519+01	6	3ba5c3f0-8003-4c1c-8bf5-929a12e396f5	12	1	\N	[{"rdv": {}, "uuid": "8a948309-3010-4e06-87ab-d926ba775bcf", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "e8e8c681-9151-4335-8e1c-4e9140946b02", "statut": "INSTRUCTION", "dateFin": "2021-11-30T14:05:21.634Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-11-30T14:05:21.634Z", "dateDecision": "2021-11-30T14:05:21.634Z"}, "isActive": false, "createdAt": "2021-11-30T14:05:21.634Z", "entretien": {}, "ayantsDroits": [], "createdEvent": "new-decision", "etapeDemande": 1, "historyEndDate": "2021-11-29T23:59:59.999Z", "historyBeginDate": "2021-11-30T00:00:00.000Z"}, {"rdv": {"dateRdv": "2021-11-30T14:04:24.108Z"}, "uuid": "3340be09-4e14-466d-8650-f9ed04571cda", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "e8e8c681-9151-4335-8e1c-4e9140946b02", "statut": "INSTRUCTION", "dateFin": "2021-11-30T14:05:21.634Z", "dateDecision": "2021-11-30T14:05:21.634Z"}, "isActive": false, "createdAt": "2021-11-30T14:05:24.114Z", "entretien": {}, "ayantsDroits": [], "createdEvent": "update-rdv", "etapeDemande": 2, "historyEndDate": "2021-11-29T23:59:59.999Z", "historyBeginDate": "2021-11-30T00:00:00.000Z"}, {"rdv": {"dateRdv": "2021-11-30T14:04:24.108Z"}, "uuid": "c9ffbf85-373a-4e00-be02-22ccbbfc7471", "typeDom": "PREMIERE_DOM", "decision": {"statut": "VALIDE", "dateFin": "2022-11-29T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-11-30T00:00:00.000Z", "dateDecision": "2021-11-30T14:05:31.936Z"}, "isActive": true, "createdAt": "2021-11-30T14:05:31.936Z", "entretien": {}, "ayantsDroits": [], "createdEvent": "new-decision", "etapeDemande": 5, "historyEndDate": "2021-11-29T23:59:59.999Z", "historyBeginDate": "2021-11-30T00:00:00.000Z"}, {"rdv": {"dateRdv": "2021-11-30T14:04:24.108Z"}, "uuid": "83ba99be-8940-40ab-87bc-af8732ae148b", "typeDom": "PREMIERE_DOM", "decision": {"motif": "A_SA_DEMANDE", "statut": "RADIE", "dateFin": "2021-11-30T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-11-30T00:00:00.000Z", "dateDecision": "2021-11-30T14:05:41.678Z"}, "isActive": false, "createdAt": "2021-11-30T14:05:41.678Z", "entretien": {}, "ayantsDroits": [], "createdEvent": "new-decision", "etapeDemande": 5, "historyBeginDate": "2021-11-30T00:00:00.000Z"}]	t
a5b823b9-3ccb-4876-ae8f-1c37cc26cb82	2022-03-17 17:34:17.76764+01	2024-01-09 17:12:53.613519+01	6	6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	1	5	\N	[{"rdv": {}, "uuid": "83b55328-9a7e-408e-b950-aa0f78baa3d2", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "db8c8e7d-0300-48e3-a970-10588d410194", "statut": "INSTRUCTION", "dateFin": "2022-03-17T11:34:17.714Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2022-03-17T11:34:17.714Z", "dateDecision": "2022-03-17T11:34:17.714Z"}, "isActive": false, "createdAt": "2022-03-17T11:34:17.714Z", "entretien": {}, "ayantsDroits": [], "createdEvent": "new-decision", "etapeDemande": 1, "historyEndDate": "2022-03-16T23:59:59.999Z", "historyBeginDate": "2022-03-17T00:00:00.000Z"}, {"rdv": {"dateRdv": "2022-03-17T16:33:19.998Z"}, "uuid": "fe7b2bd7-72e4-402a-b75f-eccb578e9c7b", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "db8c8e7d-0300-48e3-a970-10588d410194", "statut": "INSTRUCTION", "dateFin": "2022-03-17T11:34:17.714Z", "dateDebut": "2022-03-17T11:34:17.714Z", "dateDecision": "2022-03-17T11:34:17.714Z"}, "isActive": false, "createdAt": "2022-03-17T16:34:20.003Z", "entretien": {}, "ayantsDroits": [], "createdEvent": "update-rdv", "etapeDemande": 2, "historyEndDate": "2022-03-16T23:59:59.999Z", "historyBeginDate": "2022-03-17T00:00:00.000Z"}, {"rdv": {"dateRdv": "2022-03-17T16:33:19.998Z"}, "uuid": "01f27cab-e46a-4cf8-8738-a535d986fe65", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "db8c8e7d-0300-48e3-a970-10588d410194", "statut": "INSTRUCTION", "dateFin": "2022-03-17T11:34:17.714Z", "dateDebut": "2022-03-17T11:34:17.714Z", "dateDecision": "2022-03-17T11:34:17.714Z"}, "isActive": false, "createdAt": "2022-03-17T16:34:24.815Z", "entretien": {"cause": "HEBERGE_SANS_ADRESSE", "raison": "EXERCICE_DROITS", "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "domiciliation": null, "accompagnement": null}, "ayantsDroits": [], "createdEvent": "update-entretien", "etapeDemande": 3, "historyEndDate": "2022-03-15T23:59:59.999Z", "historyBeginDate": "2022-03-17T00:00:00.000Z"}, {"rdv": {"dateRdv": "2022-03-17T16:33:19.998Z"}, "uuid": "c0abf345-e1d9-43aa-b176-8132d0ac67ad", "typeDom": "PREMIERE_DOM", "decision": {"statut": "VALIDE", "dateFin": "2023-03-15T22:59:59.999Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2022-03-16T19:00:00.000Z", "dateDecision": "2022-03-17T11:34:29.960Z"}, "isActive": true, "createdAt": "2022-03-17T11:34:29.960Z", "entretien": {"cause": "HEBERGE_SANS_ADRESSE", "raison": "EXERCICE_DROITS", "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "domiciliation": null, "accompagnement": null}, "ayantsDroits": [], "createdEvent": "new-decision", "etapeDemande": 5, "historyBeginDate": "2022-03-16T00:00:00.000Z"}]	t
a929d923-03b1-448e-ad84-ae8022bb6375	2021-06-15 11:19:07.821605+02	2024-01-09 17:12:53.613519+01	3	4dcdcddc-fad2-4827-aac5-0acf1df7b5bc	5	1	\N	[{"rdv": {}, "uuid": "2f085735-e57e-408e-912a-85be84be0f54", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "6f18c8d5-27b7-45c5-882d-e23876a3b1ed", "motif": "", "statut": "INSTRUCTION", "dateFin": "2020-10-07T18:52:09.797Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2019-10-07T18:52:09.797Z", "orientation": "", "dateDecision": "2019-10-07T18:53:06.510Z"}, "isActive": false, "createdAt": "2019-10-07T18:53:06.510Z", "entretien": {"cause": "ERRANCE", "revenus": false, "residence": "HEBERGEMENT_TIERS", "liencommune": null, "domiciliation": false, "accompagnement": true}, "ayantsDroits": [{"lien": "ENFANT", "dateNaissance": "1990-10-12T00:00:00.000Z"}], "createdEvent": "new-decision", "historyEndDate": "2019-10-06T23:59:59.999Z", "historyBeginDate": "2019-10-07T00:00:00.000Z"}, {"rdv": {}, "uuid": "5a51890d-e9c6-4ac6-843f-6d536ca35674", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "c6aabd3b-7485-4efd-8c09-5080b91709d9", "statut": "ATTENTE_DECISION", "dateFin": "2021-01-27T09:21:49.242Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2019-10-07T19:28:10.777Z", "dateDecision": "2019-10-07T19:28:10.777Z"}, "isActive": false, "createdAt": "2019-10-07T19:28:10.777Z", "entretien": {"cause": "ERRANCE", "revenus": false, "residence": "HEBERGEMENT_TIERS", "liencommune": null, "domiciliation": false, "accompagnement": true}, "ayantsDroits": [{"lien": "ENFANT", "dateNaissance": "1990-10-12T00:00:00.000Z"}], "createdEvent": "new-decision", "historyBeginDate": "2019-10-07T00:00:00.000Z"}]	t
b72110a6-5fc9-4b1e-900a-6d37abcf3fca	2021-06-15 11:19:07.821605+02	2024-01-09 17:12:53.613519+01	3	97b7e840-0e93-4bf4-ba7d-0a406aa898f2	2	1	\N	[{"rdv": {}, "uuid": "8e143f47-89fd-4a47-b2f3-a4b5b2428b76", "typeDom": "RENOUVELLEMENT", "decision": {"uuid": "178ad317-0bd1-41e7-ad87-fd371f166310", "motif": null, "statut": "VALIDE", "dateFin": "2020-02-12T00:00:00.000Z", "typeDom": "RENOUVELLEMENT", "dateDebut": "2019-02-12T00:00:00.000Z", "orientation": "", "dateDecision": "2019-02-12T00:00:00.000Z"}, "isActive": true, "createdAt": "2019-02-12T00:00:00.000Z", "entretien": {"cause": "ERRANCE", "raison": "AUTRE", "revenus": false, "residence": "DOMICILE_MOBILE", "typeMenage": "COUPLE_AVEC_ENFANT", "liencommune": null, "orientation": true, "domiciliation": true, "accompagnement": true}, "ayantsDroits": [{"lien": "CONJOINT", "dateNaissance": "1978-12-20T00:00:00.000Z"}], "createdEvent": "new-decision", "historyBeginDate": "2019-02-12T00:00:00.000Z"}]	t
3912f2ce-3afb-4864-aa45-b0926415af55	2021-06-15 11:19:07.821605+02	2024-01-09 17:12:53.613519+01	3	ee7ef219-b101-422c-8ad4-4d5aedf9caad	6	1	\N	[{"rdv": {}, "uuid": "49d9ccf6-bbb9-42ca-b299-2dd31b20e337", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "8bd1eae7-7635-4c75-ba64-ad78b1141baf", "statut": "INSTRUCTION", "dateFin": "2020-11-01T17:50:10.042Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2020-11-01T17:50:10.042Z", "dateDecision": "2020-11-01T17:50:10.042Z"}, "isActive": false, "createdAt": "2020-11-01T17:50:10.042Z", "entretien": {"cause": "VIOLENCE", "raison": "EXERCICE_DROITS", "revenus": true, "residence": "HEBERGEMENT_TIERS", "typeMenage": "FEMME_ISOLE_AVEC_ENFANT", "liencommune": null, "orientation": false, "domiciliation": true, "accompagnement": false}, "ayantsDroits": [{"lien": "PARENT", "dateNaissance": "1991-12-20T00:00:00.000Z"}], "createdEvent": "new-decision", "historyEndDate": "2020-10-31T23:59:59.999Z", "historyBeginDate": "2020-11-01T00:00:00.000Z"}, {"rdv": {}, "uuid": "e3b7e93c-eda7-43c1-a335-1600fe3277f7", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "bf35d476-35d6-4d3d-93b4-dfd49816904f", "statut": "VALIDE", "dateFin": "2021-10-31T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2020-11-01T00:00:00.000Z", "dateDecision": "2020-11-01T17:50:29.003Z"}, "isActive": true, "createdAt": "2020-11-01T17:50:29.003Z", "entretien": {"cause": "VIOLENCE", "raison": "EXERCICE_DROITS", "revenus": true, "residence": "HEBERGEMENT_TIERS", "typeMenage": "FEMME_ISOLE_AVEC_ENFANT", "liencommune": null, "orientation": false, "domiciliation": true, "accompagnement": false}, "ayantsDroits": [{"lien": "PARENT", "dateNaissance": "1991-12-20T00:00:00.000Z"}], "createdEvent": "new-decision", "historyBeginDate": "2020-11-01T00:00:00.000Z"}]	t
ce874a1e-8ac1-42c8-9929-dcfb592f5523	2021-06-28 15:24:22.936448+02	2024-01-09 17:12:53.613519+01	6	b2c26e55-ab37-457d-b307-6fe161050a9b	7	1	\N	[{"rdv": {}, "uuid": "d3b443ce-4708-47d1-a87d-a860ce3fd4b4", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "db7ff8b2-66e3-47ee-9346-e080945b418e", "statut": "INSTRUCTION", "dateFin": "2021-06-28T13:24:22.920Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-06-28T13:24:22.920Z", "dateDecision": "2021-06-28T13:24:22.920Z"}, "isActive": false, "createdAt": "2021-06-28T13:24:22.920Z", "entretien": {}, "ayantsDroits": [{"lien": "ENFANT", "dateNaissance": "2015-08-15T00:00:00.000Z"}, {"lien": "ENFANT", "dateNaissance": "2018-12-03T00:00:00.000Z"}], "createdEvent": "new-decision", "etapeDemande": 1, "historyEndDate": "2021-06-27T23:59:59.999Z", "historyBeginDate": "2021-06-28T00:00:00.000Z"}, {"rdv": {"dateRdv": "2021-06-28T13:23:27.041Z"}, "uuid": "0a01158b-c0ab-4338-ba58-b46c7553cf39", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "db7ff8b2-66e3-47ee-9346-e080945b418e", "statut": "INSTRUCTION", "dateFin": "2021-06-28T13:24:22.920Z", "dateDecision": "2021-06-28T13:24:22.920Z"}, "isActive": false, "createdAt": "2021-06-28T13:24:27.050Z", "entretien": {}, "ayantsDroits": [{"lien": "ENFANT", "dateNaissance": "2015-08-15T00:00:00.000Z"}, {"lien": "ENFANT", "dateNaissance": "2018-12-03T00:00:00.000Z"}], "createdEvent": "update-rdv", "etapeDemande": 2, "historyEndDate": "2021-06-27T23:59:59.999Z", "historyBeginDate": "2021-06-28T00:00:00.000Z"}, {"rdv": {"dateRdv": "2021-06-28T13:23:27.041Z"}, "uuid": "1a721c90-5ba1-4aa8-ad95-c2a77fa7c620", "typeDom": "PREMIERE_DOM", "decision": {"uuid": "db7ff8b2-66e3-47ee-9346-e080945b418e", "statut": "INSTRUCTION", "dateFin": "2021-06-28T13:24:22.920Z", "dateDecision": "2021-06-28T13:24:22.920Z"}, "isActive": false, "createdAt": "2021-06-28T13:25:11.943Z", "entretien": {"cause": "RUPTURE", "raison": "AUTRE", "revenus": false, "residence": "HEBERGEMENT_TIERS", "typeMenage": "FEMME_ISOLE_AVEC_ENFANT", "liencommune": null, "orientation": false, "domiciliation": true, "accompagnement": false}, "ayantsDroits": [{"lien": "ENFANT", "dateNaissance": "2015-08-15T00:00:00.000Z"}, {"lien": "ENFANT", "dateNaissance": "2018-12-03T00:00:00.000Z"}], "createdEvent": "update-entretien", "etapeDemande": 3, "historyEndDate": "2021-06-27T23:59:59.999Z", "historyBeginDate": "2021-06-28T00:00:00.000Z"}, {"rdv": {"dateRdv": "2021-06-28T13:23:27.041Z"}, "uuid": "becf0e3b-edc7-4e5c-87de-285d67366737", "typeDom": "PREMIERE_DOM", "decision": {"statut": "VALIDE", "dateFin": "2022-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-06-28T00:00:00.000Z", "dateDecision": "2021-06-28T13:25:20.685Z"}, "isActive": true, "createdAt": "2021-06-28T13:25:20.685Z", "entretien": {"cause": "RUPTURE", "raison": "AUTRE", "revenus": false, "residence": "HEBERGEMENT_TIERS", "typeMenage": "FEMME_ISOLE_AVEC_ENFANT", "liencommune": null, "orientation": false, "domiciliation": true, "accompagnement": false}, "ayantsDroits": [{"lien": "ENFANT", "dateNaissance": "2015-08-15T00:00:00.000Z"}, {"lien": "ENFANT", "dateNaissance": "2018-12-03T00:00:00.000Z"}], "createdEvent": "new-decision", "etapeDemande": 5, "historyBeginDate": "2021-06-28T00:00:00.000Z"}]	t
\.


--
-- Data for Name: usager_notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usager_notes (uuid, "createdAt", "updatedAt", version, id, "usagerUUID", "structureId", "usagerRef", message, archived, "createdBy", "archivedBy", "archivedAt", pinned) FROM stdin;
a3e124ac-7a5b-4d5a-827b-cddde06983a0	2023-05-24 17:51:34.325934+02	2023-05-24 17:51:40.757875+02	2	1	a034b69a-210a-4a3d-b7a9-8987840ef0c7	1	10	Note de test	f	{"userId": 1, "userName": "Patrick Roméro"}	\N	\N	f
e2df956a-cb5c-40f7-97f1-ab72b9002043	2023-05-24 17:51:38.893081+02	2023-05-24 17:51:40.761267+02	3	2	a034b69a-210a-4a3d-b7a9-8987840ef0c7	1	10	2eme note	f	{"userId": 1, "userName": "Patrick Roméro"}	\N	\N	t
\.


--
-- Data for Name: usager_options_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usager_options_history (uuid, "createdAt", "updatedAt", version, "usagerUUID", "userId", "userName", "structureId", action, type, nom, prenom, adresse, actif, "dateDebut", "dateFin", "dateNaissance") FROM stdin;
c9192746-debf-48de-bd13-6fb5b2ee866b	2022-03-08 23:22:50.29536+01	2022-03-08 23:22:50.29536+01	1	97b7e840-0e93-4bf4-ba7d-0a406aa898f2	1	Patrick Roméro	1	CREATION	transfert	Hôpital saint-antoine	\N	10 rue d'amsterdam, paris 10	t	2022-03-17	2022-03-31	\N
315a308a-f0d0-4aff-9dbd-deb604f37213	2022-03-08 23:24:17.740348+01	2022-03-08 23:24:17.740348+01	1	97b7e840-0e93-4bf4-ba7d-0a406aa898f2	1	Patrick Roméro	1	DELETE	transfert	Hôpital saint-antoine	\N	10 rue d'amsterdam, paris 10	t	2022-03-17	2022-03-31	\N
83b3a23f-2085-4f41-808b-409ab05d68d3	2022-03-08 23:26:18.597459+01	2022-03-08 23:26:18.597459+01	1	97b7e840-0e93-4bf4-ba7d-0a406aa898f2	1	Patrick Roméro	1	CREATION	procuration	Marzouki	Moncef	\N	t	2021-09-12	2022-05-31	2000-03-12
6b2d709e-5bbb-4d0e-9af2-0aecb41ded85	2022-03-08 23:26:37.754744+01	2022-03-08 23:26:37.754744+01	1	97b7e840-0e93-4bf4-ba7d-0a406aa898f2	1	Patrick Roméro	1	EDIT	procuration	Marzouki	Moncef	\N	t	2021-09-12	2022-05-31	2000-03-12
\.


--
-- Data for Name: user_structure; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_structure (uuid, "createdAt", "updatedAt", version, email, fonction, id, "lastLogin", nom, password, prenom, role, "structureId", mails, "passwordLastUpdate", verified, "acceptTerms") FROM stdin;
663b9baa-2880-406c-a93a-32fe65528037	2020-11-17 14:18:47.658346+01	2020-11-17 14:18:47.658346+01	1	s1-instructeur@yopmail.com	\N	2	\N	Juste	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Isabelle	simple	1	{"guide": false, "import": false}	\N	t	\N
59c846d8-0592-4790-a5e2-1daae9b8776e	2020-11-14 14:18:27.658736+01	2020-11-14 14:18:27.658736+01	1	s1-facteur@yopmail.com	\N	6	2021-06-28 15:27:26.095+02	Dupuis	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Facteur 1	facteur	1	{"guide": true, "import": true}	\N	t	\N
4e049e3d-bb65-48e5-8661-b1ccdc9db985	2021-09-21 00:03:26.186917+02	2021-09-21 00:03:26.186917+02	2	s3-instructeur@yopmail.com	Simple testeur	8	\N	Jacquet	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Aimé	simple	3	{"guide": false, "import": false}	\N	t	\N
44f1cfe8-eae9-49d5-aedb-76dda856c413	2021-02-01 17:12:30.90825+01	2021-02-01 17:13:04.64034+01	2	s4-admin@yopmail.com	Testeur admin	7	\N	Test	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Import	admin	4	{"guide": false, "import": false}	\N	t	\N
d81c5566-94f9-4ee4-ab57-a604a654f79b	2020-11-17 14:32:22.193933+01	2020-11-17 14:39:14.015103+01	17	s3-admin@yopmail.com	\N	5	2020-11-17 14:39:13.796+01	Roseline	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Parmentier	admin	3	{"guide": false, "import": false}	2020-11-17 14:39:14.013+01	t	\N
f6b20e00-77e7-46e6-b48d-8cca69161042	2020-11-17 14:32:22.193+01	2021-12-06 16:26:01.366576+01	4	s3-gestionnaire@yopmail.com	Responsable structure	10	2021-12-06 16:26:01.365+01	Etchebest	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Philippe	responsable	3	{"guide": false, "import": false}	\N	t	\N
d19ece1f-d32b-498c-9427-eb12b1251163	2020-11-17 14:26:29.482634+01	2020-11-17 14:26:29.490297+01	2	s3-facteur@yopmail.com	\N	4	\N	Test	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Facteur	facteur	3	{"guide": false, "import": false}	\N	t	\N
b0140303-79e3-436c-9c41-1eaefeeaed6e	2020-11-17 14:23:20.248011+01	2022-03-09 00:20:21.36073+01	9	s1-gestionnaire@yopmail.com	\N	3	2022-03-09 00:20:21.356+01	Smith	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Peter	responsable	1	{"guide": false, "import": false}	\N	t	\N
343b62db-6c85-4896-b994-18c8c89b710f	2022-03-17 17:25:53.798318+01	2022-03-23 22:08:39.505536+01	36	s5-admin@yopmail.com	\N	11	2022-03-23 22:08:39.502+01	Pali	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Mauricette	admin	5	{"guide": false, "import": false}	2022-03-17 17:25:53.78+01	t	\N
da01f451-9c4f-4f6c-98bb-c635277e33e7	2020-11-17 14:18:47.658346+01	2023-12-18 17:52:44.098203+01	391	s1-admin@yopmail.com	\N	1	2023-12-18 17:52:44.097+01	Roméro	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Patrick	admin	1	{"guide": false, "import": false}	\N	t	2023-02-14 18:33:51.261+01
\.


--
-- Data for Name: user_structure_security; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_structure_security (uuid, "createdAt", "updatedAt", version, "userId", "structureId", "temporaryTokens", "eventsHistory") FROM stdin;
7aef1d02-3021-4988-937c-f18fa6244b14	2021-03-15 16:53:55.740856+01	2021-03-15 16:53:55.740856+01	1	2	1	\N	[]
0068d982-390a-4c42-9b63-55f5c78c6cfd	2021-03-15 16:53:55.740856+01	2021-03-15 16:53:55.740856+01	1	5	3	\N	[]
e931e0d8-ecbb-478a-97a3-a01eac88e24f	2021-03-15 16:53:55.740856+01	2021-03-15 16:53:55.740856+01	1	4	1	\N	[]
3e2118c1-1e0b-4ce7-bc85-22001eebc8ee	2021-03-15 16:53:55.740856+01	2021-03-15 16:53:55.740856+01	1	7	4	\N	[]
8dddd469-7b63-44f3-8166-15830e80ee7b	2021-03-15 16:53:55.740856+01	2021-03-15 16:53:55.740856+01	1	6	1	\N	[]
759bdc26-be9d-4ffb-95c9-8c2d7a06a63b	2021-03-15 16:53:55.740856+01	2021-03-15 16:53:55.740856+01	1	8	3	\N	[]
d84e9cc2-5c52-4a02-880e-bcfb27180594	2021-03-15 16:53:55.74+01	2021-12-06 16:26:00.681872+01	2	10	3	\N	[{"date": "2021-12-06T15:26:00.672Z", "type": "login-success"}]
9fe998b5-7178-44b5-9c40-2e18ba233f1d	2021-03-15 16:53:55.740856+01	2022-03-09 00:20:17.365808+01	3	3	1	\N	[{"date": "2022-03-08T23:20:17.329Z", "type": "login-success"}]
80e97a87-9d11-4487-a3c3-411bbdf42a2c	2022-03-17 17:25:53.809705+01	2022-03-23 22:07:14.867562+01	3	11	5	\N	[{"date": "2022-03-17T16:33:43.464Z", "type": "login-success"}, {"date": "2022-03-23T21:07:14.852Z", "type": "login-success"}]
e0bcefc6-f1be-4c83-ac9d-6ea47335a9c3	2021-03-15 16:53:55.740856+01	2023-12-18 17:52:44.068978+01	8	1	1	\N	[{"date": "2023-12-18T16:52:44.066Z", "type": "login-success"}]
\.


--
-- Data for Name: user_usager; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_usager (uuid, "createdAt", "updatedAt", version, id, "usagerUUID", "structureId", login, password, salt, "isTemporaryPassword", "lastLogin", "passwordLastUpdate", "lastPasswordResetDate", "lastPasswordResetStructureUser", enabled, "acceptTerms") FROM stdin;
a03a9a49-ae31-4160-9879-bab02dc46361	2021-11-30 14:50:26.278073+01	2023-11-20 16:40:58.362384+01	17	2	97b7e840-0e93-4bf4-ba7d-0a406aa898f2	1	LNQIFFBK	$2a$10$/MxpSdJoHG59JaksJx5eSe4U1tHGcVoHEvlDRoi.AsVW2LlybKNnG	$2a$10$zmuPXxUOuQJ7nE6ag4.x6e	f	2023-11-20 16:40:58.36+01	2021-11-30 15:01:39.675+01	2021-11-30 14:50:26.275+01	{"userId": 1, "userName": "Patrick Roméro"}	t	\N
a657f4bd-e4d1-4c38-bdd0-ffd268b356df	2021-10-05 11:34:41.369505+02	2023-12-18 17:54:10.81286+01	19	1	b2c26e55-ab37-457d-b307-6fe161050a9b	1	WKYJBDXS	$2a$10$1rKKqmxsaIKyNkyZpm5QHufHZ8JfCSgEtaLOv07oy2QE.O8msCVPO	$2a$10$1rKKqmxsaIKyNkyZpm5QHu	t	2021-11-30 15:02:07.69+01	\N	2021-10-05 11:34:41.365+02	{"userId": 1, "userName": "Patrick Roméro"}	t	\N
\.


--
-- Data for Name: user_usager_login; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_usager_login (uuid, "createdAt", "updatedAt", version, "usagerUUID", "structureId") FROM stdin;
3927beaf-04d8-4cbb-9be7-c7c9086434b3	2023-11-20 16:40:44.4121+01	2023-11-20 16:40:44.4121+01	1	97b7e840-0e93-4bf4-ba7d-0a406aa898f2	1
e80dafea-8fe4-4792-92b9-3608c723aa1b	2023-11-20 16:40:58.289642+01	2023-11-20 16:40:58.289642+01	1	97b7e840-0e93-4bf4-ba7d-0a406aa898f2	1
\.


--
-- Data for Name: user_usager_security; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_usager_security (uuid, "createdAt", "updatedAt", version, "userId", "structureId", "eventsHistory") FROM stdin;
fadd55b6-ca41-48d4-bd56-238b1a3c6f7b	2021-11-30 14:50:26.290488+01	2023-11-20 16:40:58.2674+01	10	2	1	[{"date": "2023-11-20T15:40:44.378Z", "type": "login-success"}, {"date": "2023-11-20T15:40:58.265Z", "type": "login-success"}]
9bc8decb-5f78-48de-8c1b-9f61ea5acfba	2021-10-05 11:34:41.388922+02	2023-12-18 17:54:10.816927+01	4	1	1	[{"date": "2023-12-18T16:54:10.810Z", "type": "reset-password-success"}]
\.


--
-- Name: structure_doc_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.structure_doc_id_seq', 1, false);


--
-- Name: structure_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.structure_id_seq', 5, true);


--
-- Name: usager_notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usager_notes_id_seq', 2, true);


--
-- Name: user_structure_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_structure_id_seq', 11, true);


--
-- Name: user_usager_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_usager_id_seq', 2, true);


--
-- PostgreSQL database dump complete
--

