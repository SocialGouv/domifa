-- IMPORTANT: make psql fails in case of error (else error won't be reported by github action)
\
set
  ON_ERROR_STOP true -- NOTE
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

TRUNCATE TABLE public.usager_history_states RESTART IDENTITY CASCADE;

TRUNCATE TABLE public.user_structure RESTART IDENTITY CASCADE;

TRUNCATE TABLE public.user_structure_security RESTART IDENTITY CASCADE;

TRUNCATE TABLE public.user_usager RESTART IDENTITY CASCADE;

TRUNCATE TABLE public.user_usager_security RESTART IDENTITY CASCADE;

TRUNCATE TABLE public.usager_options_history RESTART IDENTITY CASCADE;--
-- PostgreSQL database dump
--

-- Dumped from database version 15.7
-- Dumped by pg_dump version 15.7

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
66859af4-96c7-41e0-9a68-9c8994acd79a	2024-10-30 22:35:13.095317+01	2024-10-30 22:35:13.095317+01	1	1	7	1	USAGERS_DOCS_UPLOAD
\.


--
-- Data for Name: contact_support; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_support (uuid, "createdAt", "updatedAt", version, "userId", "structureId", content, attachment, email, name, "structureName", subject) FROM stdin;
\.


--
-- Data for Name: structure; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.structure (uuid, "createdAt", "updatedAt", version, id, adresse, "adresseCourrier", agrement, capacite, "codePostal", "complementAdresse", departement, region, email, "hardReset", "tokenDelete", import, "registrationDate", "importDate", "lastLogin", nom, options, responsable, "structureType", token, verified, ville, sms, "portailUsager", "timeZone", telephone, "acceptTerms", "filesUpdated", latitude, longitude, "organismeType", "departmentName", "regionName") FROM stdin;
e159011b-6648-426d-a772-b3ca4f27a6d5	2021-01-26 08:51:53.846157+01	2024-02-05 13:16:50.077269+01	5	2	2 rue du test	\N	\N	\N	33600	\N	33	75	cias.test@yopmail.com	\N		f	2020-11-17 14:32:21.959+01	\N	2020-11-17	CIAS de Test	{"numeroBoite": false}	{"nom": "Anna", "prenom": "Dupond", "fonction": "PDG"}	cias	b1ca3193633282c675257f1b05771a7605a4aa1c5ba231b3545564bfa33a	f	Pessac	{"schedule": {"friday": false, "monday": false, "tuesday": true, "thursday": true, "wednesday": false}, "senderName": null, "senderDetails": null, "enabledByDomifa": false, "enabledByStructure": false}	{"enabledByDomifa": true, "enabledByStructure": false, "usagerLoginUpdateLastInteraction": false}	Europe/Paris	{"numero": "0102030405", "countryCode": "fr"}	\N	f	44.817602	-0.612957	\N	Gironde	Nouvelle-Aquitaine
610966c4-ab91-43c0-88da-483ae23d0af2	2021-02-01 17:12:30.65884+01	2024-02-05 13:16:50.088388+01	11	4	rue de l'import	{"actif": false, "ville": "", "adresse": "", "codePostal": ""}	123	\N	44000		44	52	test.import@yopmail.com	\N	\N	f	2021-02-01 17:12:30.655+01	\N	\N	Structure de Test d'import	{"numeroBoite": false}	{"nom": "Test", "prenom": "Import", "fonction": "Testeur"}	asso		t	Nantes	{"schedule": {"friday": false, "monday": false, "tuesday": true, "thursday": true, "wednesday": false}, "senderName": "STRUCTURE D", "senderDetails": "STRUCTURE D", "enabledByDomifa": true, "enabledByStructure": false}	{"enabledByDomifa": true, "enabledByStructure": false, "usagerLoginUpdateLastInteraction": false}	Europe/Paris	{"numero": "0101010101", "countryCode": "fr"}	\N	f	47.213973	-1.536923	\N	Loire-Atlantique	Pays de la Loire
1d1ed6f0-7674-474a-908b-d0bd8c6389cb	2021-01-26 08:51:53.846157+01	2024-02-05 13:16:50.088388+01	7	3	1 rue du test de l'organise agréé	\N	1234	80	44000	\N	44	52	structure@yopmail.com	{"token": "6V0XR2S", "userId": 3}		t	2020-11-17 14:34:35.821+01	\N	2021-12-06	Organisme agréé de Test	{"numeroBoite": false}	{"nom": "Calvez", "prenom": "Simon", "fonction": "Directeur"}	asso	b8e2e05b767ac984f0f4b8a222062b07268f46265525f98d83e4b518b343	f	Nantes	{"schedule": {"friday": false, "monday": false, "tuesday": true, "thursday": true, "wednesday": false}, "senderName": null, "senderDetails": null, "enabledByDomifa": false, "enabledByStructure": false}	{"enabledByDomifa": true, "enabledByStructure": false, "usagerLoginUpdateLastInteraction": false}	Europe/Paris	{"numero": "0506070809", "countryCode": "fr"}	\N	f	47.218193	-1.561368	\N	Loire-Atlantique	Pays de la Loire
943d3acc-2f9c-4bb4-9419-4194bbdfd624	2022-03-17 17:25:53.666507+01	2024-02-05 13:16:50.117779+01	38	5	24, avenue Louis PASTEUR	{"actif": false, "ville": null, "adresse": null, "codePostal": ""}		\N	97300	\N	973	03	ccas-cayenne@yopmail.com	\N	\N	f	2022-03-17 17:25:53.646+01	\N	2022-03-23	CCAS de Cayenne	{"numeroBoite": false}	{"nom": "Pali", "prenom": "Mauricette", "fonction": "Directrice"}	cias		t	Cayenne	{"schedule": {"friday": false, "monday": false, "tuesday": true, "thursday": true, "wednesday": false}, "senderName": "CCAS DE CAY", "senderDetails": "CCAS DE CAY", "enabledByDomifa": true, "enabledByStructure": false}	{"enabledByDomifa": true, "enabledByStructure": false, "usagerLoginUpdateLastInteraction": false}	America/Cayenne	{"numero": "0101010101", "countryCode": "gf"}	\N	f	4.943454	-52.324458	\N	Guyane	Guyane
412f6962-fc6e-4e48-b0a6-a37d6eebbc67	2021-01-26 08:51:53.846157+01	2024-10-30 22:34:44.083873+01	371	1	1 rue de l'océan	\N	\N	\N	92600	\N	92	11	ccas.test@yopmail.com	\N		f	2020-11-17 14:30:23.692+01	\N	2024-10-30	CCAS de Test	{"numeroBoite": false}	{"nom": "Jean", "prenom": "Thomson", "fonction": "PDG"}	ccas	adfbfe24ff6de1f4e7c0011ad05028f5a129ced7f120079d20c4adf21d89	t	Asnieres-sur-seine	{"schedule": {"friday": false, "monday": false, "tuesday": true, "thursday": true, "wednesday": false}, "senderName": "CCAS DE TES", "senderDetails": "CCAS DE TES", "enabledByDomifa": true, "enabledByStructure": false}	{"enabledByDomifa": true, "enabledByStructure": true, "usagerLoginUpdateLastInteraction": false}	Europe/Paris	{"numero": "0602030405", "countryCode": "fr"}	2023-02-14 18:33:51.265+01	f	48.903759	2.283746	\N	Hauts-de-Seine	Île-de-France
\.


--
-- Data for Name: user_structure; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_structure (uuid, "createdAt", "updatedAt", version, email, fonction, id, "lastLogin", nom, password, prenom, role, "structureId", mails, "passwordLastUpdate", verified, "acceptTerms", territories, "userRightStatus") FROM stdin;
663b9baa-2880-406c-a93a-32fe65528037	2020-11-17 14:18:47.658346+01	2020-11-17 14:18:47.658346+01	1	s1-instructeur@yopmail.com	\N	2	\N	Juste	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Isabelle	simple	1	{"guide": false, "import": false}	\N	t	\N	\N	structure
59c846d8-0592-4790-a5e2-1daae9b8776e	2020-11-14 14:18:27.658736+01	2020-11-14 14:18:27.658736+01	1	s1-facteur@yopmail.com	\N	6	2021-06-28 15:27:26.095+02	Dupuis	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Facteur 1	facteur	1	{"guide": true, "import": true}	\N	t	\N	\N	structure
4e049e3d-bb65-48e5-8661-b1ccdc9db985	2021-09-21 00:03:26.186917+02	2021-09-21 00:03:26.186917+02	2	s3-instructeur@yopmail.com	Simple testeur	8	\N	Jacquet	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Aimé	simple	3	{"guide": false, "import": false}	\N	t	\N	\N	structure
44f1cfe8-eae9-49d5-aedb-76dda856c413	2021-02-01 17:12:30.90825+01	2021-02-01 17:13:04.64034+01	2	s4-admin@yopmail.com	Testeur admin	7	\N	Test	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Import	admin	4	{"guide": false, "import": false}	\N	t	\N	\N	structure
d81c5566-94f9-4ee4-ab57-a604a654f79b	2020-11-17 14:32:22.193933+01	2020-11-17 14:39:14.015103+01	17	s3-admin@yopmail.com	\N	5	2020-11-17 14:39:13.796+01	Roseline	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Parmentier	admin	3	{"guide": false, "import": false}	2020-11-17 14:39:14.013+01	t	\N	\N	structure
f6b20e00-77e7-46e6-b48d-8cca69161042	2020-11-17 14:32:22.193+01	2021-12-06 16:26:01.366576+01	4	s3-gestionnaire@yopmail.com	Responsable structure	10	2021-12-06 16:26:01.365+01	Etchebest	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Philippe	responsable	3	{"guide": false, "import": false}	\N	t	\N	\N	structure
d19ece1f-d32b-498c-9427-eb12b1251163	2020-11-17 14:26:29.482634+01	2020-11-17 14:26:29.490297+01	2	s3-facteur@yopmail.com	\N	4	\N	Test	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Facteur	facteur	3	{"guide": false, "import": false}	\N	t	\N	\N	structure
b0140303-79e3-436c-9c41-1eaefeeaed6e	2020-11-17 14:23:20.248011+01	2022-03-09 00:20:21.36073+01	9	s1-gestionnaire@yopmail.com	\N	3	2022-03-09 00:20:21.356+01	Smith	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Peter	responsable	1	{"guide": false, "import": false}	\N	t	\N	\N	structure
343b62db-6c85-4896-b994-18c8c89b710f	2022-03-17 17:25:53.798318+01	2022-03-23 22:08:39.505536+01	36	s5-admin@yopmail.com	\N	11	2022-03-23 22:08:39.502+01	Pali	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Mauricette	admin	5	{"guide": false, "import": false}	2022-03-17 17:25:53.78+01	t	\N	\N	structure
da01f451-9c4f-4f6c-98bb-c635277e33e7	2020-11-17 14:18:47.658346+01	2024-10-30 22:34:43.742052+01	392	preprod.domifa@fabrique.social.gouv.fr	\N	1	2024-10-30 22:34:43.742+01	Roméro	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Patrick	admin	1	{"guide": false, "import": false}	\N	t	2023-02-14 18:33:51.261+01	\N	structure
\.


--
-- Data for Name: expired_token; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expired_token (uuid, "createdAt", "updatedAt", version, "userId", "structureId", token, "userProfile") FROM stdin;
\.


--
-- Data for Name: usager; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usager (uuid, "createdAt", "updatedAt", version, ref, "customRef", "structureId", nom, prenom, surnom, sexe, "dateNaissance", "villeNaissance", langue, email, "datePremiereDom", "typeDom", decision, historique, "ayantsDroits", "lastInteraction", "etapeDemande", rdv, options, import, migrated, telephone, "contactByPhone", "numeroDistribution", "pinnedNote", nationalite, statut, nom_prenom_surnom_ref) FROM stdin;
16fe01bb-0c4d-4836-a24a-07d117b47fb9	2021-11-30 15:02:59.193913+01	2022-12-19 11:29:56.621829+01	5	9	9	1	TOMOU	Papah		homme	2001-11-03 01:00:00+01	Paris	\N		\N	PREMIERE_DOM	{"uuid": "c46924e6-fc2a-47d6-955c-8f7cabae70e3", "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-11-30T14:02:59.189Z", "userName": "Patrick Roméro", "dateDecision": "2021-11-30T14:02:59.189Z"}	[{"uuid": "c46924e6-fc2a-47d6-955c-8f7cabae70e3", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-11-30T14:02:59.189Z", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-11-30T14:02:59.189Z", "motifDetails": null, "orientationDetails": null}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2021-11-30T14:02:59.187Z"}	2	\N	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N	\N	INSTRUCTION	tomou papah 9
a034b69a-210a-4a3d-b7a9-8987840ef0c7	2021-11-30 15:03:28.817939+01	2023-05-24 17:51:40.763319+02	6	10	10	1	Dupan	Tom		homme	1988-02-02 01:00:00+01	Marseille	\N		\N	PREMIERE_DOM	{"uuid": "fbe59327-0fef-4d74-ade1-97120407f43c", "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-11-30T14:03:28.817Z", "userName": "Patrick Roméro", "dateDecision": "2021-11-30T14:03:28.817Z"}	[{"uuid": "fbe59327-0fef-4d74-ade1-97120407f43c", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-11-30T14:03:28.817Z", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-11-30T14:03:28.817Z", "motifDetails": null, "orientationDetails": null}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2021-11-30T14:03:28.816Z"}	2	\N	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	{"message": "2eme note", "createdAt": "2023-05-24T15:51:38.893Z", "createdBy": {"userId": 1, "userName": "Patrick Roméro"}, "usagerRef": 10}	\N	INSTRUCTION	dupan tom 10
427e6af6-706b-40d4-9506-de21190e6f0d	2021-01-27 10:21:49.173276+01	2022-12-19 11:29:56.621829+01	7	4	4	1	Loumiel	Lisa	Lilou	femme	1990-04-18 02:00:00+02	Marseille	\N	\N	2019-08-09 02:00:00+02	PREMIERE_DOM	{"uuid": "0c3f2589-d5d3-4138-a4bc-2a594678461e", "motif": "NON_RESPECT_REGLEMENT", "statut": "RADIE", "userId": 1, "dateFin": "2019-09-12T00:00:00.000Z", "typeDom": "PREMIERE", "userName": "Patrick Roméro", "dateDebut": "2019-08-09T00:00:00.000Z", "orientation": "", "dateDecision": "2019-09-12T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[{"uuid": "0c3f2589-d5d3-4138-a4bc-2a594678461e", "motif": "NON_RESPECT_REGLEMENT", "statut": "RADIE", "userId": 1, "dateFin": "2019-09-12T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2019-08-09T00:00:00.000Z", "orientation": null, "dateDecision": "2019-09-12T00:00:00.000Z", "motifDetails": null, "orientationDetails": null}]	[]	{"appel": null, "visite": null, "colisIn": 0, "enAttente": false, "courrierIn": 0, "nbCourrier": 0, "courrierOut": null, "recommandeIn": 0, "recommandeOut": null, "dateInteraction": "2021-01-27T09:21:49.240Z"}	5	\N	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "0606060606", "countryCode": "FR"}	f	\N	\N	\N	RADIE	loumiel lisa lilou 4
e074c416-093a-46fc-ae47-77a3bc111d35	2021-01-27 10:21:49.173276+01	2022-12-19 11:29:56.621829+01	6	3	3	1	Dupont	Fred	fredo	homme	1940-08-07 02:00:00+02	Macon	\N	\N	2019-10-07 20:50:25.552+02	PREMIERE_DOM	{"uuid": "30ababd0-8e2f-4917-9662-9c812d604dda", "motif": "SATURATION", "statut": "REFUS", "userId": 1, "dateFin": "2020-08-09T00:00:00.000Z", "typeDom": "PREMIERE", "userName": "Patrick Roméro", "dateDebut": "2019-09-12T00:00:00.000Z", "orientation": "", "dateDecision": "2019-09-12T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[{"uuid": "30ababd0-8e2f-4917-9662-9c812d604dda", "motif": "SATURATION", "statut": "REFUS", "userId": 1, "dateFin": "2020-08-09T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2019-09-12T00:00:00.000Z", "orientation": null, "dateDecision": "2019-09-12T00:00:00.000Z", "motifDetails": null, "orientationDetails": null}]	[]	{"appel": null, "visite": null, "colisIn": 0, "enAttente": false, "courrierIn": 0, "nbCourrier": 0, "courrierOut": null, "recommandeIn": 0, "recommandeOut": null, "dateInteraction": "2021-01-27T09:21:49.237Z"}	5	\N	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N	\N	REFUS	dupont fred fredo 3
97b7e840-0e93-4bf4-ba7d-0a406aa898f2	2019-11-22 11:33:43+01	2022-12-19 11:29:56.621829+01	536	2	63	1	Karamoko	Maurice	\N	homme	1998-08-07 02:00:00+02	Bouaké, Côte d'Ivoire	\N	domicilie2@yopmail.com	2018-01-11 01:00:00+01	RENOUVELLEMENT	{"uuid": "178ad317-0bd1-41e7-ad87-fd371f166310", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2020-02-12T00:00:00.000Z", "typeDom": "RENOUVELLEMENT", "userName": "Patrick Roméro", "dateDebut": "2019-02-12T00:00:00.000Z", "orientation": "", "dateDecision": "2019-02-12T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[{"uuid": "178ad317-0bd1-41e7-ad87-fd371f166310", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2020-02-12T00:00:00.000Z", "typeDom": "RENOUVELLEMENT", "userName": "Patrick Roméro", "dateDebut": "2019-02-12T00:00:00.000Z", "orientation": null, "dateDecision": "2019-02-12T00:00:00.000Z", "motifDetails": null, "orientationDetails": null}]	[{"nom": "Karamoko", "lien": "CONJOINT", "prenom": "Mauricette", "dateNaissance": "1978-12-20T00:00:00.000Z"}]	{"colisIn": 3, "enAttente": true, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2020-12-01T10:00:24.980Z"}	3	\N	{"npai": {"actif": false}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [{"nom": "Milani", "prenom": "Marcel", "dateFin": "2022-06-05T00:00:00.000Z", "dateDebut": "2021-10-01T00:00:00.000Z", "dateNaissance": "1983-03-17T00:00:00.000Z"}], "portailUsagerEnabled": true}	\N	t	{"numero": "0606060606", "countryCode": "FR"}	f	\N	\N	\N	VALIDE	karamoko maurice 2
274427da-7482-4edb-86aa-4afaf48243d5	2021-11-30 15:04:46.21552+01	2022-12-19 11:29:56.621829+01	9	11	11	1	Saura	Sophie		homme	1999-08-20 02:00:00+02	Lyon	\N		\N	PREMIERE_DOM	{"statut": "ATTENTE_DECISION", "userId": 1, "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-11-30T14:04:56.881Z", "dateDecision": "2021-11-30T14:04:56.881Z"}	[{"uuid": "73cb88b5-c4bf-42ee-b6db-2f6f32d4fbc3", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-11-30T14:04:46.214Z", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-11-30T14:04:46.214Z", "motifDetails": null, "orientationDetails": null}, {"motif": null, "statut": "ATTENTE_DECISION", "userId": 1, "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-11-30T14:04:56.881Z", "motifDetails": null, "orientationDetails": null}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2021-11-30T14:04:46.212Z"}	4	{"userId": 1, "dateRdv": "2021-11-30T14:03:48.988Z", "userName": "Patrick Roméro"}	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N	\N	ATTENTE_DECISION	saura sophie 11
860ffa4c-88c4-4e1c-ad42-5a05cdf39830	2019-11-22 11:33:43+01	2022-12-19 11:29:56.621829+01	9	1	63	1	Ramirez	Marta	\N	femme	1978-08-07 02:00:00+02	Sao Paulo, Brésil	\N	domicilie1@yopmail.com	2018-03-01 01:00:00+01	PREMIERE_DOM	{"uuid": "52ba789e-eb21-4d84-9176-abe1e0d3c778", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2019-02-27T00:00:00.000Z", "typeDom": "PREMIERE", "userName": "Patrick Roméro", "dateDebut": "2018-03-01T00:00:00.000Z", "orientation": "", "dateDecision": "2018-03-01T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[{"uuid": "52ba789e-eb21-4d84-9176-abe1e0d3c778", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2019-02-27T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2018-03-01T00:00:00.000Z", "orientation": null, "dateDecision": "2018-03-01T00:00:00.000Z", "motifDetails": null, "orientationDetails": null}]	[{"nom": "Martinez", "lien": "ENFANT", "prenom": "Luiz", "dateNaissance": "1992-12-20T00:00:00.000Z"}, {"nom": "Martinez", "lien": "ENFANT", "prenom": "Sylvia", "dateNaissance": "2007-10-20T00:00:00.000Z"}]	{"colisIn": 4, "enAttente": true, "courrierIn": 1, "recommandeIn": 3, "dateInteraction": "2020-07-29T11:46:34.680Z"}	5	\N	{"npai": {"actif": false}, "transfert": {"nom": "LHSS Plaisance", "actif": true, "adresse": "12 rue ridder 75014 Paris", "dateFin": "2020-11-07T00:00:00.000Z", "dateDebut": "2020-06-03T12:20:00.603Z"}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "0600000000", "countryCode": "FR"}	f	\N	\N	\N	VALIDE	ramirez marta 1
5215f197-5f9b-4c2a-8b2e-60a0fcc5fc85	2021-06-28 15:26:31.533838+02	2022-12-19 11:29:56.621829+01	9	8	8	1	Smith	John		homme	2000-03-15 01:00:00+01	Londres	\N		\N	PREMIERE_DOM	{"motif": "LIEN_COMMUNE", "statut": "REFUS", "userId": 1, "dateFin": "2021-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-06-28T00:00:00.000Z", "orientation": "asso", "dateDecision": "2021-06-28T13:27:25.493Z", "motifDetails": null, "orientationDetails": "CCAS de sa commune"}	[{"uuid": "6d781a28-a5dc-4d95-826d-6aa0f78e5864", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-06-28T13:26:31.533Z", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-06-28T13:26:31.533Z", "motifDetails": null, "orientationDetails": null}, {"motif": "LIEN_COMMUNE", "statut": "REFUS", "userId": 1, "dateFin": "2021-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-06-28T00:00:00.000Z", "orientation": "asso", "dateDecision": "2021-06-28T13:27:25.493Z", "motifDetails": null, "orientationDetails": "CCAS de sa commune"}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2021-06-28T13:26:31.530Z"}	5	{"userId": 1, "dateRdv": "2021-06-28T13:25:42.151Z", "userName": "Patrick Roméro"}	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N	\N	REFUS	smith john 8
3ba5c3f0-8003-4c1c-8bf5-929a12e396f5	2021-11-30 15:05:21.635622+01	2022-12-19 11:29:56.621829+01	10	12	12	1	Rara	Dié		homme	1975-08-08 01:00:00+01	Nantes	\N		2021-11-30 01:00:00+01	PREMIERE_DOM	{"motif": "A_SA_DEMANDE", "statut": "RADIE", "userId": 1, "dateFin": "2021-11-30T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-11-30T00:00:00.000Z", "dateDecision": "2021-11-30T14:05:41.678Z", "motifDetails": null}	[{"uuid": "e8e8c681-9151-4335-8e1c-4e9140946b02", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-11-30T14:05:21.634Z", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-11-30T14:05:21.634Z", "motifDetails": null, "orientationDetails": null}, {"motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2022-11-29T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "customRef": "12", "dateDebut": "2021-11-30T00:00:00.000Z", "orientation": null, "dateDecision": "2021-11-30T14:05:31.936Z", "motifDetails": null, "orientationDetails": null}, {"motif": "A_SA_DEMANDE", "statut": "RADIE", "userId": 1, "dateFin": "2021-11-30T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-11-30T00:00:00.000Z", "orientation": null, "dateDecision": "2021-11-30T14:05:41.678Z", "motifDetails": null, "orientationDetails": null}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2021-11-30T14:05:21.631Z"}	5	{"userId": 1, "dateRdv": "2021-11-30T14:04:24.108Z", "userName": "Patrick Roméro"}	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N	\N	RADIE	rara die 12
6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	2022-03-17 17:34:17.752334+01	2022-12-19 11:29:56.621829+01	78	1	1	5	Salvador	Henri	\N	homme	1960-02-12 01:00:00+01	Cayenne	\N	\N	2022-03-16 20:00:00+01	PREMIERE_DOM	{"statut": "VALIDE", "userId": 11, "dateFin": "2023-03-15T22:59:59.999Z", "typeDom": "PREMIERE_DOM", "userName": "Mauricette Pali", "customRef": "1", "dateDebut": "2022-03-16T19:00:00.000Z", "dateDecision": "2022-03-17T11:34:29.960Z"}	[{"uuid": "db8c8e7d-0300-48e3-a970-10588d410194", "motif": null, "statut": "INSTRUCTION", "userId": 11, "dateFin": "2022-03-17T11:34:17.714Z", "userName": "Mauricette Pali", "dateDebut": "2022-03-17T11:34:17.714Z", "orientation": null, "dateDecision": "2022-03-17T11:34:17.714Z", "motifDetails": null, "orientationDetails": null}, {"motif": null, "statut": "VALIDE", "userId": 11, "dateFin": "2023-03-15T22:59:59.999Z", "typeDom": "PREMIERE_DOM", "userName": "Mauricette Pali", "customRef": "1", "dateDebut": "2022-03-16T19:00:00.000Z", "orientation": null, "dateDecision": "2022-03-17T11:34:29.960Z", "motifDetails": null, "orientationDetails": null}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2020-12-01T05:00:24.980Z"}	5	{"userId": 11, "dateRdv": "2022-03-17T16:33:19.998Z", "userName": "Mauricette Pali"}	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N	\N	VALIDE	salvador henri 1
ee7ef219-b101-422c-8ad4-4d5aedf9caad	2020-11-01 18:50:10.047+01	2022-12-19 11:29:56.621829+01	8	6	6	1	NOUVEAU	DOSSIER	TEST	homme	1988-11-02 01:00:00+01	Paris	\N	fake-mail@yopmail.com	2020-11-01 01:00:00+01	PREMIERE_DOM	{"uuid": "bf35d476-35d6-4d3d-93b4-dfd49816904f", "statut": "VALIDE", "userId": 1, "dateFin": "2021-10-31T00:00:00.000Z", "userName": "Patrick Roméro", "dateDebut": "2020-11-01T00:00:00.000Z", "dateDecision": "2020-11-01T17:50:29.003Z", "orientationDetails": null}	[{"uuid": "8bd1eae7-7635-4c75-ba64-ad78b1141baf", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2020-11-01T17:50:10.042Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2020-11-01T17:50:10.042Z", "orientation": null, "dateDecision": "2020-11-01T17:50:10.042Z", "motifDetails": null, "orientationDetails": null}, {"uuid": "bf35d476-35d6-4d3d-93b4-dfd49816904f", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2021-10-31T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2020-11-01T00:00:00.000Z", "orientation": null, "dateDecision": "2020-11-01T17:50:29.003Z", "motifDetails": null, "orientationDetails": null}]	[{"nom": "TEST 1 ", "lien": "PARENT", "prenom": "TEST 2 ", "dateNaissance": "1991-12-20T00:00:00.000Z"}]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2020-11-01T00:00:00.000Z"}	5	{"userId": 1, "dateRdv": "2020-11-01T17:50:12.019Z", "userName": "Roméro Patrick"}	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "0600000000", "countryCode": "FR"}	f	\N	\N	\N	VALIDE	nouveau dossier test 6
4dcdcddc-fad2-4827-aac5-0acf1df7b5bc	2021-01-27 10:21:49.173276+01	2022-12-19 11:29:56.621829+01	7	5	5	1	Derick	Inspecteur	\N	homme	1911-05-24 00:00:00+00	Bergerac	\N	\N	\N	PREMIERE_DOM	{"uuid": "c6aabd3b-7485-4efd-8c09-5080b91709d9", "statut": "ATTENTE_DECISION", "userId": 2, "dateFin": "2021-01-27T09:21:49.242Z", "userName": "Isabelle Juste", "dateDecision": "2019-10-07T19:28:10.777Z", "orientationDetails": null}	[{"uuid": "6f18c8d5-27b7-45c5-882d-e23876a3b1ed", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2020-10-07T18:52:09.797Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2019-10-07T18:52:09.797Z", "orientation": null, "dateDecision": "2019-10-07T18:53:06.510Z", "motifDetails": null, "orientationDetails": null}, {"uuid": "c6aabd3b-7485-4efd-8c09-5080b91709d9", "motif": null, "statut": "ATTENTE_DECISION", "userId": 2, "dateFin": "2021-01-27T09:21:49.242Z", "typeDom": "PREMIERE_DOM", "userName": "Isabelle Juste", "dateDebut": "2019-10-07T19:28:10.777Z", "orientation": null, "dateDecision": "2019-10-07T19:28:10.777Z", "motifDetails": null, "orientationDetails": null}]	[{"nom": "Inspecteur", "lien": "ENFANT", "prenom": "Gadget", "dateNaissance": "1990-10-12T00:00:00.000Z"}]	{"appel": null, "visite": null, "colisIn": 0, "enAttente": false, "courrierIn": 0, "nbCourrier": 0, "courrierOut": null, "recommandeIn": 0, "recommandeOut": null, "dateInteraction": "2021-01-27T09:21:49.242Z"}	0	{"userId": 2, "dateRdv": "2019-10-07T19:30:02.675Z", "userName": "Juste Isabelle"}	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N	\N	ATTENTE_DECISION	derick inspecteur 5
b2c26e55-ab37-457d-b307-6fe161050a9b	2021-06-28 15:24:22.924091+02	2023-12-18 17:54:10.680396+01	37	7	7	1	Dupont	Pauline	Paula	homme	1996-01-02 01:00:00+01	Paris	fr		2021-06-28 02:00:00+02	PREMIERE_DOM	{"statut": "VALIDE", "userId": 1, "dateFin": "2022-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-06-28T00:00:00.000Z", "dateDecision": "2021-06-28T13:25:20.685Z"}	[{"uuid": "db7ff8b2-66e3-47ee-9346-e080945b418e", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-06-28T13:24:22.920Z", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-06-28T13:24:22.920Z", "motifDetails": null, "orientationDetails": null}, {"motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2022-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-06-28T00:00:00.000Z", "orientation": null, "dateDecision": "2021-06-28T13:25:20.685Z", "motifDetails": null, "orientationDetails": null}]	[{"nom": "Dupont", "lien": "ENFANT", "prenom": "Paulin", "dateNaissance": "2015-08-15T00:00:00.000Z"}, {"nom": "Dupont", "lien": "ENFANT", "prenom": "Sophie", "dateNaissance": "2018-12-03T00:00:00.000Z"}]	{"colisIn": 1, "enAttente": true, "courrierIn": 2, "recommandeIn": 0, "dateInteraction": "2021-06-28T13:25:36.004Z"}	5	{"userId": 1, "dateRdv": "2021-06-28T13:23:27.041Z", "userName": "Patrick Roméro"}	{"npai": {"actif": false}, "transfert": {"actif": false}, "procurations": [], "portailUsagerEnabled": true}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N	\N	VALIDE	dupont pauline paula 7
\.


--
-- Data for Name: interactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.interactions (uuid, "createdAt", "updatedAt", version, "dateInteraction", "nbCourrier", "structureId", type, "usagerRef", "userId", "userName", content, "usagerUUID", "interactionOutUUID", procuration, "returnToSender") FROM stdin;
4fc32424-3f6e-48c7-9ef1-02b9db388445	2020-11-18 12:01:52.072912+01	2020-11-18 12:01:52.072912+01	1	2020-11-01 19:47:00.286+01	3	1	recommandeIn	1	1	Patrick Roméro		860ffa4c-88c4-4e1c-ad42-5a05cdf39830	\N	f	f
44ba43d0-ab44-4449-a6e1-40cbcbc92adc	2020-11-18 12:01:52.072912+01	2020-11-18 12:01:52.072912+01	1	2020-11-01 19:47:03.303+01	4	1	colisIn	1	1	Patrick Roméro		860ffa4c-88c4-4e1c-ad42-5a05cdf39830	\N	f	f
b174770d-dfb4-45ea-bf5c-58f1288ff6dd	2020-11-18 12:01:52.072912+01	2020-11-18 12:01:52.072912+01	1	2020-11-01 19:47:06.168+01	1	1	courrierIn	1	1	Patrick Roméro		860ffa4c-88c4-4e1c-ad42-5a05cdf39830	\N	f	f
f3b49608-cb17-4fdb-b793-8da431cd6ffe	2021-06-28 15:25:35.998265+02	2021-06-28 15:25:35.998265+02	1	2021-06-28 17:25:35.997+02	2	1	courrierOut	7	1	Patrick Roméro	\N	b2c26e55-ab37-457d-b307-6fe161050a9b	\N	f	f
53a50f2d-c906-421e-be21-8857dfca97fc	2021-06-28 15:25:36.005054+02	2021-06-28 15:25:36.005054+02	1	2021-06-28 17:25:36.004+02	2	1	colisOut	7	1	Patrick Roméro	\N	b2c26e55-ab37-457d-b307-6fe161050a9b	\N	f	f
7d27aea0-d9ae-4529-b1ee-e40a4eadf1ab	2021-06-28 15:25:37.471534+02	2021-06-28 15:25:37.471534+02	1	2021-06-28 17:25:37.47+02	1	1	courrierIn	7	1	Patrick Roméro	\N	b2c26e55-ab37-457d-b307-6fe161050a9b	\N	f	f
212f8184-972a-4cb3-ae83-d1738659cbf9	2021-06-28 15:25:45.842905+02	2021-06-28 15:25:45.842905+02	1	2021-06-28 17:25:45.842+02	1	1	courrierIn	7	1	Patrick Roméro	Courrier très important	b2c26e55-ab37-457d-b307-6fe161050a9b	\N	f	f
8abd81e6-403f-49f3-999a-0ead3e6456c5	2021-06-28 15:25:51.252592+02	2021-06-28 15:25:51.252592+02	1	2021-06-28 17:25:51.252+02	1	1	colisIn	7	1	Patrick Roméro	\N	b2c26e55-ab37-457d-b307-6fe161050a9b	\N	f	f
b68794a5-1d02-48ca-9cc7-8b43b4a4bbf0	2021-06-28 15:25:28.404973+02	2021-12-24 01:46:32.485168+01	2	2021-06-28 17:25:28.404+02	2	1	courrierIn	7	1	Patrick Roméro		b2c26e55-ab37-457d-b307-6fe161050a9b	f3b49608-cb17-4fdb-b793-8da431cd6ffe	f	f
fb8dde95-b421-4cf0-b205-9e940d9641e5	2021-06-28 15:25:28.512802+02	2021-12-24 01:46:32.491031+01	2	2021-06-28 17:25:28.512+02	1	1	colisIn	7	1	Patrick Roméro		b2c26e55-ab37-457d-b307-6fe161050a9b	53a50f2d-c906-421e-be21-8857dfca97fc	f	f
0a0dbf1d-055f-47db-b2ae-013c611033e8	2021-06-28 15:25:33.70286+02	2021-12-24 01:46:32.491031+01	2	2021-06-28 17:25:33.702+02	1	1	colisIn	7	1	Patrick Roméro	\N	b2c26e55-ab37-457d-b307-6fe161050a9b	53a50f2d-c906-421e-be21-8857dfca97fc	f	f
2bbb1a89-c14f-4f32-8928-965dc2565174	2022-03-17 22:40:01.392572+01	2022-03-17 22:40:01.392572+01	1	2020-12-01 06:00:24.98+01	0	5	courrierOut	1	11	Mauricette Pali		6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	\N	f	f
eaa91392-fe09-4faa-9bbd-3722b25dd013	2022-03-17 22:39:10.963799+01	2022-03-17 22:39:10.963799+01	1	2020-12-01 06:00:24.98+01	0	5	courrierOut	1	11	Mauricette Pali		6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	\N	f	f
03d2f113-726a-4cab-8cee-f111cdbc2c66	2022-03-17 22:40:29.896899+01	2022-03-17 22:40:29.955167+01	3	2020-12-01 11:00:24.98+01	3	1	colisIn	2	1	Patrick Roméro	Colis à donner en urgence	97b7e840-0e93-4bf4-ba7d-0a406aa898f2	\N	f	f
bbf70ce8-d4d6-4318-adc6-143af0a06daa	2022-03-17 22:40:30.030609+01	2022-03-17 22:40:30.030609+01	1	2020-12-01 11:00:24.98+01	0	1	visite	2	1	Patrick Roméro	\N	97b7e840-0e93-4bf4-ba7d-0a406aa898f2	\N	f	f
efabd6a5-e8d3-464d-a700-f0fd723a43b9	2022-03-17 22:40:30.315091+01	2022-03-17 22:40:30.315091+01	1	2020-12-01 06:00:24.98+01	0	5	courrierOut	1	11	Mauricette Pali		6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	\N	f	f
ccfdb5d8-dbb6-4cf8-9818-cd0f4211021e	2022-03-17 22:39:21.729672+01	2022-03-17 22:39:21.729672+01	1	2020-12-01 06:00:24.98+01	0	5	courrierOut	1	11	Mauricette Pali		6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	\N	f	f
672bae2a-dfb3-41f3-a3d9-8eda89783612	2022-03-17 22:37:37.935256+01	2022-03-17 22:37:37.935256+01	1	2020-12-01 06:00:24.98+01	0	5	courrierOut	1	11	Mauricette Pali		6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	\N	f	f
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

COPY public.open_data_places (uuid, "createdAt", "updatedAt", version, nom, adresse, "complementAdresse", ville, "codePostal", departement, region, latitude, longitude, source, "uniqueId", software, mail, "structureType", "domifaStructureId", "soliguideStructureId", "mssId") FROM stdin;
76300842-bc69-44fa-b065-d25811577488	2024-06-10 23:40:47.573677+02	2024-06-10 23:40:47.573677+02	1	CIAS de Test	2 rue du test	\N	Pessac	33600	33	75	44.8176020	-0.6129570	domifa	2	domifa	cias.test@yopmail.com	cias	2	\N	\N
06fddd44-f43d-4f51-98fb-a3f02ac4d1f7	2024-06-10 23:40:47.598272+02	2024-06-10 23:40:47.598272+02	1	Structure de Test d'import	rue de l import	\N	Nantes	44000	44	52	47.2139730	-1.5369230	domifa	4	domifa	test.import@yopmail.com	asso	4	\N	\N
bbd8d2a1-8e61-4847-8df3-a727d2934c00	2024-06-10 23:40:47.609642+02	2024-06-10 23:40:47.609642+02	1	Organisme agréé de Test	1 rue du test de l organise agree	\N	Nantes	44000	44	52	47.2181930	-1.5613680	domifa	3	domifa	structure@yopmail.com	asso	3	\N	\N
e6b3ab89-e258-4036-afb9-cb5bfc251f9e	2024-06-10 23:40:47.617545+02	2024-06-10 23:40:47.617545+02	1	CCAS de Test	1 rue de l ocean	\N	Asnieres sur seine	92600	92	11	48.9037590	2.2837460	domifa	1	domifa	ccas.test@yopmail.com	ccas	1	\N	\N
e8562e2a-a4f4-43ca-925a-8c9edb4c4214	2024-06-10 23:40:47.623644+02	2024-06-10 23:40:47.623644+02	1	CCAS de Cayenne	24 avenue louis pasteur	\N	Cayenne	97300	973	03	4.9434540	-52.3244580	domifa	5	domifa	ccas-cayenne@yopmail.com	cias	5	\N	\N
0ce5a757-cddb-43e4-9791-787f3fec1c83	2024-06-10 23:40:48.733435+02	2024-10-29 23:41:21.808585+01	2	ESI La maison du partage	32 rue bouret 75019 paris	\N	Paris	75019	75	11	48.8817267	2.3742211	soliguide	0	other	mpartage@armeedusalut.fr	asso	\N	0	\N
804eab73-9fea-4503-ba8e-63fda07dd576	2024-06-10 23:40:47.829184+02	2024-10-29 23:41:21.825822+01	3	zy'va	8 residence des glycines	\N	Nanterre	92000	92	11	48.9096160	2.2234740	mss	89e679b1-bf3a-459c-a461-c35b9a70c9fc	mss	\N	asso	\N	\N	89e679b1-bf3a-459c-a461-c35b9a70c9fc
d4d90f8d-2833-464c-95a2-20b2a4b69183	2024-06-10 23:41:58.586803+02	2024-10-29 23:41:21.828754+01	2	Wifisilver	cocoyer	\N	Le gosier	97190	971	01	16.2369420	-61.4843700	mss	35615c85-02de-4744-b0a1-0db96f745fb0	mss	\N	asso	\N	\N	35615c85-02de-4744-b0a1-0db96f745fb0
5c450f0e-a0f4-419c-a0f3-c4bff46d2fd0	2024-06-10 23:41:58.632393+02	2024-10-29 23:41:21.8307+01	2	URGENCES ET SOLIDARITES	11 rue du jeu de ballon	\N	Aubagne	13400	13	93	43.2910970	5.5720130	mss	f675cfd7-3d1c-41e7-b880-3664671dd2a0	mss	\N	asso	\N	\N	f675cfd7-3d1c-41e7-b880-3664671dd2a0
49378a3f-c72f-4fa2-a118-d28ae881bce5	2024-06-10 23:41:58.664266+02	2024-10-29 23:41:21.83283+01	2	Udaf du Nord	10 rue baptiste monnoyer	\N	Lille	59000	59	32	50.6311070	3.0642560	mss	981c6290-0acd-4a1d-bc45-5b45d3268c66	mss	\N	asso	\N	\N	981c6290-0acd-4a1d-bc45-5b45d3268c66
60b697cf-8393-47c6-81e9-82f8d5d46e9a	2024-06-10 23:41:58.703341+02	2024-10-29 23:41:21.835701+01	2	UDAF 57	rue royal canadian air force	\N	Ars laquenexy	57530	57	44	50.5146800	1.6164260	mss	6acf9ce1-9e7b-4a67-8621-3a584e49d580	mss	\N	asso	\N	\N	6acf9ce1-9e7b-4a67-8621-3a584e49d580
fb16c6ef-000a-4dfa-a37c-9de7fc1844bc	2024-06-10 23:41:58.749211+02	2024-10-29 23:41:21.837802+01	2	UDAF 17	5 rue du bois d hure	\N	Lagord	17140	17	75	46.1893940	-1.1437190	mss	f1bc71e1-cd8b-4faa-8b2a-0ab953ac504d	mss	\N	asso	\N	\N	f1bc71e1-cd8b-4faa-8b2a-0ab953ac504d
61b92aaf-2acf-43e0-ac7b-5551721705d6	2024-06-10 23:41:58.793176+02	2024-10-29 23:41:21.83971+01	2	Turner et Vous	10 rue du colombier	\N	Faches thumesnil	59155	59	32	50.6039050	3.0697320	mss	ec9d0edd-3c97-4050-9677-767284941aa7	mss	\N	asso	\N	\N	ec9d0edd-3c97-4050-9677-767284941aa7
4ff862b5-1a28-470e-aa60-c6c59ba3f181	2024-06-10 23:41:58.83536+02	2024-10-29 23:41:21.841742+01	2	Tirelires d'Avenir	15 rue des halles	\N	Paris	75001	75	11	48.8598010	2.3466480	mss	c07258cf-2ddb-41da-9f18-f26c2519aec8	mss	\N	asso	\N	\N	c07258cf-2ddb-41da-9f18-f26c2519aec8
5b484f0b-43e3-4ebc-b97c-26c39c4737a2	2024-06-10 23:41:58.863023+02	2024-10-29 23:41:21.844644+01	2	TEST MEP - Sept	lieu dit le petey	\N	Preignac	33210	33	75	44.5490260	-0.3171830	mss	a32bec0c-ced6-45a8-a217-8c7a2ff51094	mss	\N	asso	\N	\N	a32bec0c-ced6-45a8-a217-8c7a2ff51094
212e771c-e7de-4e9a-97df-dd91f68d1a40	2024-06-10 23:41:58.898568+02	2024-10-29 23:41:21.847269+01	2	SYNTAXE ERREUR 2.0	82 quai de l europe	\N	Gueugnon	71130	71	27	46.5986120	4.0591540	mss	cdbded1f-e9d9-4d48-8432-37dccf1fee04	mss	\N	asso	\N	\N	cdbded1f-e9d9-4d48-8432-37dccf1fee04
afe101b9-e592-4f59-ae27-7d287dde810b	2024-06-10 23:41:58.934477+02	2024-10-29 23:41:21.849131+01	2	Sylvie Decot - Indépendante	4 quai victor augagneur	\N	Lyon	69003	69	84	45.7577290	4.8409200	mss	652c9cee-b233-4784-81cd-67d3ef65a316	mss	\N	asso	\N	\N	652c9cee-b233-4784-81cd-67d3ef65a316
9dc92945-2358-4e83-a462-704807c54555	2024-06-10 23:41:58.981949+02	2024-10-29 23:41:21.851477+01	2	SSP	78 rue olivier de serres	\N	Paris	75015	75	11	48.8341580	2.2955980	mss	28bc8b65-c17f-4ed7-a4e8-eb0a87d2498f	mss	\N	asso	\N	\N	28bc8b65-c17f-4ed7-a4e8-eb0a87d2498f
7902bf78-888e-4cf8-bea6-61328acc88d2	2024-06-10 23:41:59.038557+02	2024-10-29 23:41:21.853669+01	2	SOLIHA Métropole Nord	112 rue gustave dubled	\N	Croix	59170	59	32	50.6747730	3.1424450	mss	674abb7f-52fb-49fa-b113-fe2dfb10b17b	mss	\N	asso	\N	\N	674abb7f-52fb-49fa-b113-fe2dfb10b17b
87999987-20c6-4ded-a195-eddb78135cd4	2024-06-10 23:41:59.096672+02	2024-10-29 23:41:21.857263+01	2	Solid'Avenir	9 rue armand caduc	\N	La reole	33190	33	75	44.5819880	-0.0390630	mss	16f0c096-11ab-4e6c-920f-4ddd39184691	mss	\N	asso	\N	\N	16f0c096-11ab-4e6c-920f-4ddd39184691
a67cf1b0-85b0-4d1b-95fc-6a598c0d62b2	2024-06-10 23:41:59.162319+02	2024-10-29 23:41:21.859738+01	2	Solibass'	20 rue des chataigniers	\N	Biganos	33380	33	75	44.6476130	-0.9753230	mss	158dc97a-9156-4dea-8c7d-5fd89b2ea2eb	mss	\N	asso	\N	\N	158dc97a-9156-4dea-8c7d-5fd89b2ea2eb
c8f5c1f1-b6bb-43a6-a638-fd370c931d1f	2024-06-10 23:41:59.213755+02	2024-10-29 23:41:21.861003+01	2	Social Service Ouest Guyane	800 avenue paule berthelot	\N	Mana	97360	973	03	5.6536590	-53.7494250	mss	8a653668-c6e1-42ee-a869-ee0d43b8b3b0	mss	\N	asso	\N	\N	8a653668-c6e1-42ee-a869-ee0d43b8b3b0
6f6d9a6b-edda-4d19-911c-e2439b1319e2	2024-06-10 23:41:59.268499+02	2024-10-29 23:41:21.862578+01	2	SIVOM de la Communauté du Bruaysis	village sante 6f rue anatole france	\N	Camblain chatelain	62470	62	32	50.4808820	2.4608930	mss	a3173fd2-1ece-4715-8154-dbd5ce00a70f	mss	\N	asso	\N	\N	a3173fd2-1ece-4715-8154-dbd5ce00a70f
6ccf8546-c94f-414c-ae91-03a8474c103a	2024-06-10 23:41:59.324874+02	2024-10-29 23:41:21.864147+01	2	SIAS Grand Cubzaguais	365 avenue boucicaut	\N	Saint andre de cubzac	33240	33	75	45.0104010	-0.4388950	mss	24d665d0-9691-489b-8e55-fa5b6417244e	mss	\N	asso	\N	\N	24d665d0-9691-489b-8e55-fa5b6417244e
40883717-52d5-41f1-b2e7-7fff2803febe	2024-06-10 23:41:59.386558+02	2024-10-29 23:41:21.865172+01	2	Service Prévention Santé Séniors Seyssinet-Pariset	79 avenue de la republique	\N	Seyssinet pariset	38170	38	84	45.1793840	5.6969790	mss	73540492-8396-4af8-a4a7-cfd0aba9ac90	mss	\N	asso	\N	\N	73540492-8396-4af8-a4a7-cfd0aba9ac90
f76699eb-57c3-4254-9e80-410cd976db8f	2024-06-10 23:41:59.425173+02	2024-10-29 23:41:21.865997+01	2	Service Jeunesse PIL	lifou	\N	Lifou	98820	988	NC	-22.2523360	166.4521730	mss	68f55da2-6e05-4df0-95c2-d02d1d7a6bf2	mss	\N	asso	\N	\N	68f55da2-6e05-4df0-95c2-d02d1d7a6bf2
79951829-d92a-4217-aa55-c7edfeeb78a7	2024-06-10 23:41:59.470518+02	2024-10-29 23:41:21.867089+01	2	Service Habitat Jeunes Brive	32 rue clement ader	\N	Brive la gaillarde	19100	19	75	45.1595520	1.5392700	mss	31e0fe94-573e-468c-bb3d-4913a80b9b28	mss	\N	asso	\N	\N	31e0fe94-573e-468c-bb3d-4913a80b9b28
cc452c79-3669-4dc6-85fa-564631a3d48b	2024-06-10 23:41:59.530897+02	2024-10-29 23:41:21.868145+01	2	Secours Catholique Caritas France - Calais	47 rue de moscou	\N	Calais	62100	62	32	50.9591700	1.8576710	mss	ee12930d-55b1-46a6-84f9-00a00c9fd7b9	mss	\N	asso	\N	\N	ee12930d-55b1-46a6-84f9-00a00c9fd7b9
\.


--
-- Data for Name: public_stats_cache; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.public_stats_cache (uuid, "createdAt", "updatedAt", version, key, stats) FROM stdin;
\.


--
-- Data for Name: structure_doc; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.structure_doc (uuid, "createdAt", "updatedAt", version, id, label, "createdBy", custom, filetype, "structureId", path, "customDocType", "displayInPortailUsager") FROM stdin;
\.


--
-- Data for Name: structure_information; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.structure_information (uuid, "createdAt", "updatedAt", version, title, description, "isTemporary", "startDate", "endDate", type, "createdBy", "structureId") FROM stdin;
\.


--
-- Data for Name: structure_stats_reporting; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.structure_stats_reporting (uuid, "createdAt", "updatedAt", version, "waitingList", workers, volunteers, "humanCosts", "totalCosts", year, "structureId", "completedBy", "confirmationDate", "waitingTime") FROM stdin;
1015fc4f-9174-45a0-a49b-72475b6c5536	2024-05-28 21:03:55.065767+02	2024-05-28 21:03:55.065767+02	1	\N	\N	\N	\N	\N	2020	2	\N	\N	\N
6c8fdfdd-696a-4343-bb2d-13281fb0e134	2024-05-28 21:03:55.065767+02	2024-05-28 21:03:55.065767+02	1	\N	\N	\N	\N	\N	2021	2	\N	\N	\N
86684796-f41f-40ab-8f24-3e8d9bbf294d	2024-05-28 21:03:55.065767+02	2024-05-28 21:03:55.065767+02	1	\N	\N	\N	\N	\N	2022	2	\N	\N	\N
34e879e0-8f36-420f-8fb6-8e237c46d852	2024-05-28 21:03:55.065767+02	2024-05-28 21:03:55.065767+02	1	\N	\N	\N	\N	\N	2023	2	\N	\N	\N
e0f057c9-5410-4306-9b22-7c2fdc0097bf	2024-05-28 21:03:55.089489+02	2024-05-28 21:03:55.089489+02	1	\N	\N	\N	\N	\N	2020	4	\N	\N	\N
8729c6b1-fd10-423e-8234-30bf8d1f0b6c	2024-05-28 21:03:55.089489+02	2024-05-28 21:03:55.089489+02	1	\N	\N	\N	\N	\N	2021	4	\N	\N	\N
91b72976-cfaf-4ca0-90a4-8e38af55bf41	2024-05-28 21:03:55.089489+02	2024-05-28 21:03:55.089489+02	1	\N	\N	\N	\N	\N	2022	4	\N	\N	\N
b9f54526-f4fa-42dc-8455-f4350e19d96b	2024-05-28 21:03:55.089489+02	2024-05-28 21:03:55.089489+02	1	\N	\N	\N	\N	\N	2023	4	\N	\N	\N
1b4da46e-36e4-4982-8916-43ec1ce84485	2024-05-28 21:03:55.092072+02	2024-05-28 21:03:55.092072+02	1	\N	\N	\N	\N	\N	2020	3	\N	\N	\N
5b306d2f-3006-4526-836f-7a4cdc640381	2024-05-28 21:03:55.092072+02	2024-05-28 21:03:55.092072+02	1	\N	\N	\N	\N	\N	2021	3	\N	\N	\N
8daee87d-9fa2-4632-ab5e-9fea015a87f7	2024-05-28 21:03:55.092072+02	2024-05-28 21:03:55.092072+02	1	\N	\N	\N	\N	\N	2022	3	\N	\N	\N
964710fb-6322-4f49-a5b2-b4c20f488f28	2024-05-28 21:03:55.092072+02	2024-05-28 21:03:55.092072+02	1	\N	\N	\N	\N	\N	2023	3	\N	\N	\N
3e1dc458-eb09-441b-9474-b3da12c8bb27	2024-05-28 21:03:55.09392+02	2024-05-28 21:03:55.09392+02	1	\N	\N	\N	\N	\N	2020	1	\N	\N	\N
5d755854-70f0-49b4-8758-f15cb4be520b	2024-05-28 21:03:55.09392+02	2024-05-28 21:03:55.09392+02	1	\N	\N	\N	\N	\N	2021	1	\N	\N	\N
d887dd71-6b09-4eef-bfc8-3a3d28cd9ab4	2024-05-28 21:03:55.09392+02	2024-05-28 21:03:55.09392+02	1	\N	\N	\N	\N	\N	2022	1	\N	\N	\N
58ed32d3-d73f-4a07-a9bf-232c1fb4ad05	2024-05-28 21:03:55.09392+02	2024-05-28 21:03:55.09392+02	1	\N	\N	\N	\N	\N	2023	1	\N	\N	\N
9d5a9911-74ba-486c-9b12-fa044276de2f	2024-05-28 21:03:55.095505+02	2024-05-28 21:03:55.095505+02	1	\N	\N	\N	\N	\N	2020	5	\N	\N	\N
29bc3dff-f665-4876-8bbb-499d47b3f499	2024-05-28 21:03:55.095505+02	2024-05-28 21:03:55.095505+02	1	\N	\N	\N	\N	\N	2021	5	\N	\N	\N
988908a2-e347-4326-a17d-cdad1591b152	2024-05-28 21:03:55.095505+02	2024-05-28 21:03:55.095505+02	1	\N	\N	\N	\N	\N	2022	5	\N	\N	\N
4ad20ed4-df7d-45b0-8e0e-31973d8ebead	2024-05-28 21:03:55.095505+02	2024-05-28 21:03:55.095505+02	1	\N	\N	\N	\N	\N	2023	5	\N	\N	\N
\.


--
-- Data for Name: typeorm_metadata; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.typeorm_metadata (type, schema, name, value) FROM stdin;
\.


--
-- Data for Name: usager_docs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usager_docs (uuid, "createdAt", "updatedAt", version, "usagerUUID", "structureId", "usagerRef", path, label, filetype, "createdBy", "encryptionContext", "encryptionVersion", shared) FROM stdin;
2eb5e74d-4b25-4aa6-ad2a-7d963ae66072	2019-10-07 20:51:31.578+02	2022-06-28 22:52:59.282479+02	1	860ffa4c-88c4-4e1c-ad42-5a05cdf39830	1	1	373144a3d9d0b3f4c84bd527a5cff880.jpg	CNI	image/jpeg	Patrick Roméro	ffe17c48-7a1a-42c9-8494-0b72ca8b3686	0	f
a77729a9-1b28-4090-bda8-760590bff982	2019-10-07 20:53:32.922+02	2022-06-28 22:52:59.28757+02	1	4dcdcddc-fad2-4827-aac5-0acf1df7b5bc	1	5	8242ba1bc7f3c3971f761b6a347fc1c4.jpg	Carte identité	image/jpeg	Patrick Roméro	ffe17c48-7a1a-42c9-8494-0b72ca8b3686	0	f
542a0da1-ea1c-48ab-8026-67a4248b1c47	2024-10-30 22:35:12.346+01	2024-10-30 22:35:13.112661+01	1	b2c26e55-ab37-457d-b307-6fe161050a9b	1	7	ddda9bf211821bec99b90230bd0f52dc.jpg	Document à éditer par la suite	image/jpeg	Patrick Roméro	f36cb085-f3a5-4333-afbf-ba6c1c28c5d8	0	f
\.


--
-- Data for Name: usager_entretien; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usager_entretien (uuid, "createdAt", "updatedAt", version, "usagerUUID", "structureId", "usagerRef", domiciliation, commentaires, "typeMenage", revenus, "revenusDetail", orientation, "orientationDetail", liencommune, "liencommuneDetail", residence, "residenceDetail", cause, "causeDetail", rattachement, raison, "raisonDetail", accompagnement, "accompagnementDetail", "situationPro", "situationProDetail") FROM stdin;
b56c7942-55de-4e66-8bc6-7aa046d58d43	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	e074c416-093a-46fc-ae47-77a3bc111d35	1	3	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
e85b1ec0-d972-4ff3-b84c-19c0aa47f774	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	a034b69a-210a-4a3d-b7a9-8987840ef0c7	1	10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
03092425-aeaa-4a28-9818-6d583f712405	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	16fe01bb-0c4d-4836-a24a-07d117b47fb9	1	9	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
54401773-a3dc-4a67-bed9-b34a2e69cac0	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	274427da-7482-4edb-86aa-4afaf48243d5	1	11	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
071a4aa3-ae50-400e-bda0-ce39cb4265eb	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	860ffa4c-88c4-4e1c-ad42-5a05cdf39830	1	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
adeaafb2-c791-42cd-837f-ae592e55d01c	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	5215f197-5f9b-4c2a-8b2e-60a0fcc5fc85	1	8	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
57495291-d7d9-43b8-b6b7-b0fdee610bba	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	3ba5c3f0-8003-4c1c-8bf5-929a12e396f5	1	12	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7197d930-e154-4859-b46d-cb63f40fef34	2022-12-19 11:29:56.604289+01	2022-12-19 11:29:56.604289+01	1	427e6af6-706b-40d4-9506-de21190e6f0d	1	4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
03595273-f06c-4f07-8a7d-161e6c3e53b0	2022-12-19 11:29:56.604289+01	2024-02-05 17:17:17.873337+01	3	6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	5	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	HEBERGE_SANS_ADRESSE	\N	\N	EXERCICE_DROITS	\N	\N	\N	\N	\N
43df7440-579e-496e-96e6-fae9d13588f0	2022-12-19 11:29:56.604289+01	2024-02-05 17:17:17.874929+01	6	ee7ef219-b101-422c-8ad4-4d5aedf9caad	1	6	t	\N	FEMME_ISOLE_AVEC_ENFANT	t	\N	f	\N	\N	\N	HEBERGEMENT_TIERS	\N	VIOLENCE	\N	\N	EXERCICE_DROITS	\N	f	\N	\N	\N
a1f75daa-858a-4b99-a370-b8a8b69f0eae	2022-12-19 11:29:56.604289+01	2024-02-05 17:17:17.875833+01	4	97b7e840-0e93-4bf4-ba7d-0a406aa898f2	1	2	t	\N	COUPLE_AVEC_ENFANT	f	\N	t	\N	\N	\N	DOMICILE_MOBILE	\N	ERRANCE	\N	\N	AUTRE	\N	t	\N	\N	\N
2c7d5340-3758-44db-8582-2a217925e3e9	2022-12-19 11:29:56.604289+01	2024-02-05 17:17:17.875833+01	4	4dcdcddc-fad2-4827-aac5-0acf1df7b5bc	1	5	f	\N	\N	f	\N	\N	\N	\N	\N	HEBERGEMENT_TIERS	\N	ERRANCE	\N	\N	\N	\N	t	CCAS des mureaux	\N	\N
65a59363-6dd1-40b3-ab0a-aab25d2504e2	2022-12-19 11:29:56.604289+01	2024-02-05 17:17:17.875833+01	6	b2c26e55-ab37-457d-b307-6fe161050a9b	1	7	t	Ceci est un commentaire sur l'entretien	FEMME_ISOLE_AVEC_ENFANT	f	\N	f	\N	\N	\N	HEBERGEMENT_TIERS	\N	RUPTURE	\N	\N	AUTRE	\N	f	\N	\N	\N
\.


--
-- Data for Name: usager_history_states; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usager_history_states (uuid, "createdAt", "updatedAt", version, "usagerUUID", "structureId", "ayantsDroits", decision, entretien, rdv, "createdEvent", "historyBeginDate", "historyEndDate", "isActive", "typeDom", nationalite, sexe, "dateNaissance") FROM stdin;
58db5ef6-666a-41d7-ae42-511f1f919279	2021-06-28 15:24:22.92+02	2024-01-29 00:07:17.681333+01	1	b2c26e55-ab37-457d-b307-6fe161050a9b	1	[{"lien": "ENFANT", "dateNaissance": "2015-08-15T00:00:00.000Z"}, {"lien": "ENFANT", "dateNaissance": "2018-12-03T00:00:00.000Z"}]	{"uuid": "db7ff8b2-66e3-47ee-9346-e080945b418e", "motif": null, "statut": "INSTRUCTION", "dateFin": "2021-06-28T13:24:22.920Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-06-28T13:24:22.920Z", "orientation": null, "dateDecision": "2021-06-28T13:24:22.920Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{}	new-decision	2021-06-28 02:00:00+02	2021-06-28 01:59:59.999+02	f	PREMIERE_DOM	\N	homme	1996-01-02 01:00:00+01
f761688f-8589-4eda-9b3b-3491d2f31429	2021-06-28 15:24:27.05+02	2024-01-29 00:07:17.721318+01	1	b2c26e55-ab37-457d-b307-6fe161050a9b	1	[{"lien": "ENFANT", "dateNaissance": "2015-08-15T00:00:00.000Z"}, {"lien": "ENFANT", "dateNaissance": "2018-12-03T00:00:00.000Z"}]	{"uuid": "db7ff8b2-66e3-47ee-9346-e080945b418e", "motif": null, "statut": "INSTRUCTION", "dateFin": "2021-06-28T13:24:22.920Z", "orientation": null, "dateDecision": "2021-06-28T13:24:22.920Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{"dateRdv": "2021-06-28T13:23:27.041Z"}	update-rdv	2021-06-28 02:00:00+02	2021-06-28 01:59:59.999+02	f	PREMIERE_DOM	\N	homme	1996-01-02 01:00:00+01
279172c0-50d8-409f-a98e-788c270f9d72	2021-06-28 15:25:11.943+02	2024-01-29 00:07:17.725986+01	1	b2c26e55-ab37-457d-b307-6fe161050a9b	1	[{"lien": "ENFANT", "dateNaissance": "2015-08-15T00:00:00.000Z"}, {"lien": "ENFANT", "dateNaissance": "2018-12-03T00:00:00.000Z"}]	{"uuid": "db7ff8b2-66e3-47ee-9346-e080945b418e", "motif": null, "statut": "INSTRUCTION", "dateFin": "2021-06-28T13:24:22.920Z", "orientation": null, "dateDecision": "2021-06-28T13:24:22.920Z"}	{"cause": "RUPTURE", "raison": "AUTRE", "revenus": false, "residence": "HEBERGEMENT_TIERS", "typeMenage": "FEMME_ISOLE_AVEC_ENFANT", "liencommune": null, "orientation": false, "situationPro": null, "domiciliation": true, "accompagnement": false}	{"dateRdv": "2021-06-28T13:23:27.041Z"}	update-entretien	2021-06-28 02:00:00+02	2021-06-28 01:59:59.999+02	f	PREMIERE_DOM	\N	homme	1996-01-02 01:00:00+01
4d332984-6a2f-4d92-b434-59d3c807b90f	2021-06-28 15:25:20.685+02	2024-01-29 00:07:17.728927+01	1	b2c26e55-ab37-457d-b307-6fe161050a9b	1	[{"lien": "ENFANT", "dateNaissance": "2015-08-15T00:00:00.000Z"}, {"lien": "ENFANT", "dateNaissance": "2018-12-03T00:00:00.000Z"}]	{"motif": null, "statut": "VALIDE", "dateFin": "2022-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-06-28T00:00:00.000Z", "orientation": null, "dateDecision": "2021-06-28T13:25:20.685Z"}	{"cause": "RUPTURE", "raison": "AUTRE", "revenus": false, "residence": "HEBERGEMENT_TIERS", "typeMenage": "FEMME_ISOLE_AVEC_ENFANT", "liencommune": null, "orientation": false, "situationPro": null, "domiciliation": true, "accompagnement": false}	{"dateRdv": "2021-06-28T13:23:27.041Z"}	new-decision	2021-06-28 02:00:00+02	\N	t	PREMIERE_DOM	\N	homme	1996-01-02 01:00:00+01
5582718d-b0b0-4b06-acc5-77069a2e3bb2	2018-03-01 01:00:00+01	2024-01-29 00:07:17.743905+01	1	860ffa4c-88c4-4e1c-ad42-5a05cdf39830	1	[{"lien": "ENFANT", "dateNaissance": "1992-12-20T00:00:00.000Z"}, {"lien": "ENFANT", "dateNaissance": "2007-10-20T00:00:00.000Z"}]	{"uuid": "52ba789e-eb21-4d84-9176-abe1e0d3c778", "motif": null, "statut": "VALIDE", "dateFin": "2019-02-27T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2018-03-01T00:00:00.000Z", "orientation": "", "dateDecision": "2018-03-01T00:00:00.000Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{}	new-decision	2018-03-01 01:00:00+01	\N	t	PREMIERE_DOM	\N	femme	1978-08-07 02:00:00+02
1bea172a-23f0-40a8-8ff8-e1b631867fc5	2019-09-12 02:00:00+02	2024-01-29 00:07:17.748755+01	1	427e6af6-706b-40d4-9506-de21190e6f0d	1	[]	{"uuid": "0c3f2589-d5d3-4138-a4bc-2a594678461e", "motif": "NON_RESPECT_REGLEMENT", "statut": "RADIE", "dateFin": "2019-09-12T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2019-08-09T00:00:00.000Z", "orientation": "", "dateDecision": "2019-09-12T00:00:00.000Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{}	new-decision	2019-08-09 02:00:00+02	\N	f	PREMIERE_DOM	\N	femme	1990-04-18 02:00:00+02
a3b28844-826f-48d0-9214-40becd91b959	2021-06-28 15:26:31.533+02	2024-01-29 00:07:17.753207+01	1	5215f197-5f9b-4c2a-8b2e-60a0fcc5fc85	1	[]	{"uuid": "6d781a28-a5dc-4d95-826d-6aa0f78e5864", "motif": null, "statut": "INSTRUCTION", "dateFin": "2021-06-28T13:26:31.533Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-06-28T13:26:31.533Z", "orientation": null, "dateDecision": "2021-06-28T13:26:31.533Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{}	new-decision	2021-06-28 02:00:00+02	2021-06-28 01:59:59.999+02	f	PREMIERE_DOM	\N	homme	2000-03-15 01:00:00+01
28186d84-8eec-4935-899a-564175954058	2021-06-28 15:26:39.153+02	2024-01-29 00:07:17.756075+01	1	5215f197-5f9b-4c2a-8b2e-60a0fcc5fc85	1	[]	{"uuid": "6d781a28-a5dc-4d95-826d-6aa0f78e5864", "motif": null, "statut": "INSTRUCTION", "dateFin": "2021-06-28T13:26:31.533Z", "orientation": null, "dateDecision": "2021-06-28T13:26:31.533Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{"dateRdv": "2021-06-28T13:26:00.000Z"}	update-rdv	2021-06-28 02:00:00+02	2021-06-28 01:59:59.999+02	f	PREMIERE_DOM	\N	homme	2000-03-15 01:00:00+01
2baca49c-c7a3-4ab4-9bb1-028b39a16990	2021-06-28 15:26:42.157+02	2024-01-29 00:07:17.760192+01	1	5215f197-5f9b-4c2a-8b2e-60a0fcc5fc85	1	[]	{"uuid": "6d781a28-a5dc-4d95-826d-6aa0f78e5864", "motif": null, "statut": "INSTRUCTION", "dateFin": "2021-06-28T13:26:31.533Z", "orientation": null, "dateDecision": "2021-06-28T13:26:31.533Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{"dateRdv": "2021-06-28T13:25:42.151Z"}	update-rdv	2021-06-28 02:00:00+02	2021-06-28 01:59:59.999+02	f	PREMIERE_DOM	\N	homme	2000-03-15 01:00:00+01
02d52a02-1788-4d0a-b1f2-08dac5141672	2021-06-28 15:27:25.493+02	2024-01-29 00:07:17.763469+01	1	5215f197-5f9b-4c2a-8b2e-60a0fcc5fc85	1	[]	{"motif": "LIEN_COMMUNE", "statut": "REFUS", "dateFin": "2021-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-06-28T00:00:00.000Z", "orientation": "asso", "dateDecision": "2021-06-28T13:27:25.493Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{"dateRdv": "2021-06-28T13:25:42.151Z"}	new-decision	2021-06-28 02:00:00+02	\N	f	PREMIERE_DOM	\N	homme	2000-03-15 01:00:00+01
81bd58fa-d016-474d-b49a-d06b11b98e24	2021-11-30 15:02:59.189+01	2024-01-29 00:07:17.767404+01	1	16fe01bb-0c4d-4836-a24a-07d117b47fb9	1	[]	{"uuid": "c46924e6-fc2a-47d6-955c-8f7cabae70e3", "motif": null, "statut": "INSTRUCTION", "dateFin": "2021-11-30T14:02:59.189Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-11-30T14:02:59.189Z", "orientation": null, "dateDecision": "2021-11-30T14:02:59.189Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{}	new-decision	2021-11-30 01:00:00+01	\N	f	PREMIERE_DOM	\N	homme	2001-11-03 01:00:00+01
1da1aa6d-6185-4362-9d9a-f9d8e0ac4511	2021-11-30 15:03:28.817+01	2024-01-29 00:07:17.770902+01	1	a034b69a-210a-4a3d-b7a9-8987840ef0c7	1	[]	{"uuid": "fbe59327-0fef-4d74-ade1-97120407f43c", "motif": null, "statut": "INSTRUCTION", "dateFin": "2021-11-30T14:03:28.817Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-11-30T14:03:28.817Z", "orientation": null, "dateDecision": "2021-11-30T14:03:28.817Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{}	new-decision	2021-11-30 01:00:00+01	\N	f	PREMIERE_DOM	\N	homme	1988-02-02 01:00:00+01
61cc1f54-8708-44b8-88d6-3032c8f5198d	2021-11-30 15:04:46.214+01	2024-01-29 00:07:17.774667+01	1	274427da-7482-4edb-86aa-4afaf48243d5	1	[]	{"uuid": "73cb88b5-c4bf-42ee-b6db-2f6f32d4fbc3", "motif": null, "statut": "INSTRUCTION", "dateFin": "2021-11-30T14:04:46.214Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-11-30T14:04:46.214Z", "orientation": null, "dateDecision": "2021-11-30T14:04:46.214Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{}	new-decision	2021-11-30 01:00:00+01	2021-11-30 00:59:59.999+01	f	PREMIERE_DOM	\N	homme	1999-08-20 02:00:00+02
2d6140cd-f1fd-4065-a783-3600ef7f924b	2021-11-30 15:04:48.993+01	2024-01-29 00:07:17.777569+01	1	274427da-7482-4edb-86aa-4afaf48243d5	1	[]	{"uuid": "73cb88b5-c4bf-42ee-b6db-2f6f32d4fbc3", "motif": null, "statut": "INSTRUCTION", "dateFin": "2021-11-30T14:04:46.214Z", "orientation": null, "dateDecision": "2021-11-30T14:04:46.214Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{"dateRdv": "2021-11-30T14:03:48.988Z"}	update-rdv	2021-11-30 01:00:00+01	2021-11-30 00:59:59.999+01	f	PREMIERE_DOM	\N	homme	1999-08-20 02:00:00+02
89b450ce-daf6-4b33-8910-61756d1a0e74	2021-11-30 15:04:56.881+01	2024-01-29 00:07:17.779632+01	1	274427da-7482-4edb-86aa-4afaf48243d5	1	[]	{"motif": null, "statut": "ATTENTE_DECISION", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-11-30T14:04:56.881Z", "orientation": null, "dateDecision": "2021-11-30T14:04:56.881Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{"dateRdv": "2021-11-30T14:03:48.988Z"}	new-decision	2021-11-30 01:00:00+01	\N	f	PREMIERE_DOM	\N	homme	1999-08-20 02:00:00+02
96659ed4-c0d4-4f74-aa4e-7d9a09c9841e	2021-11-30 15:05:21.634+01	2024-01-29 00:07:17.782712+01	1	3ba5c3f0-8003-4c1c-8bf5-929a12e396f5	1	[]	{"uuid": "e8e8c681-9151-4335-8e1c-4e9140946b02", "motif": null, "statut": "INSTRUCTION", "dateFin": "2021-11-30T14:05:21.634Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-11-30T14:05:21.634Z", "orientation": null, "dateDecision": "2021-11-30T14:05:21.634Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{}	new-decision	2021-11-30 01:00:00+01	2021-11-30 00:59:59.999+01	f	PREMIERE_DOM	\N	homme	1975-08-08 01:00:00+01
c7425311-8c58-4938-a586-0eef5dd96a92	2021-11-30 15:05:24.114+01	2024-01-29 00:07:17.784895+01	1	3ba5c3f0-8003-4c1c-8bf5-929a12e396f5	1	[]	{"uuid": "e8e8c681-9151-4335-8e1c-4e9140946b02", "motif": null, "statut": "INSTRUCTION", "dateFin": "2021-11-30T14:05:21.634Z", "orientation": null, "dateDecision": "2021-11-30T14:05:21.634Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{"dateRdv": "2021-11-30T14:04:24.108Z"}	update-rdv	2021-11-30 01:00:00+01	2021-11-30 00:59:59.999+01	f	PREMIERE_DOM	\N	homme	1975-08-08 01:00:00+01
a2e681ff-04f2-4c13-9298-6524585adbd3	2021-11-30 15:05:31.936+01	2024-01-29 00:07:17.786905+01	1	3ba5c3f0-8003-4c1c-8bf5-929a12e396f5	1	[]	{"motif": null, "statut": "VALIDE", "dateFin": "2022-11-29T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-11-30T00:00:00.000Z", "orientation": null, "dateDecision": "2021-11-30T14:05:31.936Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{"dateRdv": "2021-11-30T14:04:24.108Z"}	new-decision	2021-11-30 01:00:00+01	2021-11-30 00:59:59.999+01	t	PREMIERE_DOM	\N	homme	1975-08-08 01:00:00+01
59bc9dcf-e6d2-4a1f-9262-ff888c57816e	2021-11-30 15:05:41.678+01	2024-01-29 00:07:17.788916+01	1	3ba5c3f0-8003-4c1c-8bf5-929a12e396f5	1	[]	{"motif": "A_SA_DEMANDE", "statut": "RADIE", "dateFin": "2021-11-30T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2021-11-30T00:00:00.000Z", "orientation": null, "dateDecision": "2021-11-30T14:05:41.678Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{"dateRdv": "2021-11-30T14:04:24.108Z"}	new-decision	2021-11-30 01:00:00+01	\N	f	PREMIERE_DOM	\N	homme	1975-08-08 01:00:00+01
b0d9e7f6-f284-4db7-89f8-03f7dd693481	2019-09-12 02:00:00+02	2024-01-29 00:07:17.792276+01	1	e074c416-093a-46fc-ae47-77a3bc111d35	1	[]	{"uuid": "30ababd0-8e2f-4917-9662-9c812d604dda", "motif": "SATURATION", "statut": "REFUS", "dateFin": "2020-08-09T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2019-09-12T00:00:00.000Z", "orientation": "", "dateDecision": "2019-09-12T00:00:00.000Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{}	new-decision	2019-09-12 02:00:00+02	\N	f	PREMIERE_DOM	\N	homme	1940-08-07 02:00:00+02
e1752813-0082-409a-9f2f-219718095361	2019-10-07 20:53:06.51+02	2024-01-29 00:07:17.79522+01	1	4dcdcddc-fad2-4827-aac5-0acf1df7b5bc	1	[{"lien": "ENFANT", "dateNaissance": "1990-10-12T00:00:00.000Z"}]	{"uuid": "6f18c8d5-27b7-45c5-882d-e23876a3b1ed", "motif": "", "statut": "INSTRUCTION", "dateFin": "2020-10-07T18:52:09.797Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2019-10-07T18:52:09.797Z", "orientation": "", "dateDecision": "2019-10-07T18:53:06.510Z"}	{"cause": "ERRANCE", "raison": null, "revenus": false, "residence": "HEBERGEMENT_TIERS", "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": false, "accompagnement": true}	{}	new-decision	2019-10-07 02:00:00+02	2019-10-07 01:59:59.999+02	f	PREMIERE_DOM	\N	homme	1911-05-24 00:00:00+00
2caa2b09-a8da-43dc-af93-1bd0d70224d3	2019-10-07 21:28:10.777+02	2024-01-29 00:07:17.797061+01	1	4dcdcddc-fad2-4827-aac5-0acf1df7b5bc	1	[{"lien": "ENFANT", "dateNaissance": "1990-10-12T00:00:00.000Z"}]	{"uuid": "c6aabd3b-7485-4efd-8c09-5080b91709d9", "motif": null, "statut": "ATTENTE_DECISION", "dateFin": "2021-01-27T09:21:49.242Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2019-10-07T19:28:10.777Z", "orientation": null, "dateDecision": "2019-10-07T19:28:10.777Z"}	{"cause": "ERRANCE", "raison": null, "revenus": false, "residence": "HEBERGEMENT_TIERS", "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": false, "accompagnement": true}	{}	new-decision	2019-10-07 02:00:00+02	\N	f	PREMIERE_DOM	\N	homme	1911-05-24 00:00:00+00
3ea2261a-a125-4bb8-b046-ebd6d25dd926	2019-02-12 01:00:00+01	2024-01-29 00:07:17.8005+01	1	97b7e840-0e93-4bf4-ba7d-0a406aa898f2	1	[{"lien": "CONJOINT", "dateNaissance": "1978-12-20T00:00:00.000Z"}]	{"uuid": "178ad317-0bd1-41e7-ad87-fd371f166310", "motif": null, "statut": "VALIDE", "dateFin": "2020-02-12T00:00:00.000Z", "typeDom": "RENOUVELLEMENT", "dateDebut": "2019-02-12T00:00:00.000Z", "orientation": "", "dateDecision": "2019-02-12T00:00:00.000Z"}	{"cause": "ERRANCE", "raison": "AUTRE", "revenus": false, "residence": "DOMICILE_MOBILE", "typeMenage": "COUPLE_AVEC_ENFANT", "liencommune": null, "orientation": true, "situationPro": null, "domiciliation": true, "accompagnement": true}	{}	new-decision	2019-02-12 01:00:00+01	\N	t	RENOUVELLEMENT	\N	homme	1998-08-07 02:00:00+02
e3c3bad7-3df4-4c17-94ca-0f9ca27cbad8	2020-11-01 18:50:10.042+01	2024-01-29 00:07:17.804201+01	1	ee7ef219-b101-422c-8ad4-4d5aedf9caad	1	[{"lien": "PARENT", "dateNaissance": "1991-12-20T00:00:00.000Z"}]	{"uuid": "8bd1eae7-7635-4c75-ba64-ad78b1141baf", "motif": null, "statut": "INSTRUCTION", "dateFin": "2020-11-01T17:50:10.042Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2020-11-01T17:50:10.042Z", "orientation": null, "dateDecision": "2020-11-01T17:50:10.042Z"}	{"cause": "VIOLENCE", "raison": "EXERCICE_DROITS", "revenus": true, "residence": "HEBERGEMENT_TIERS", "typeMenage": "FEMME_ISOLE_AVEC_ENFANT", "liencommune": null, "orientation": false, "situationPro": null, "domiciliation": true, "accompagnement": false}	{}	new-decision	2020-11-01 01:00:00+01	2020-11-01 00:59:59.999+01	f	PREMIERE_DOM	\N	homme	1988-11-02 01:00:00+01
54f6338f-73c1-4011-aa33-ea3b34b8a780	2020-11-01 18:50:29.003+01	2024-01-29 00:07:17.806843+01	1	ee7ef219-b101-422c-8ad4-4d5aedf9caad	1	[{"lien": "PARENT", "dateNaissance": "1991-12-20T00:00:00.000Z"}]	{"uuid": "bf35d476-35d6-4d3d-93b4-dfd49816904f", "motif": null, "statut": "VALIDE", "dateFin": "2021-10-31T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2020-11-01T00:00:00.000Z", "orientation": null, "dateDecision": "2020-11-01T17:50:29.003Z"}	{"cause": "VIOLENCE", "raison": "EXERCICE_DROITS", "revenus": true, "residence": "HEBERGEMENT_TIERS", "typeMenage": "FEMME_ISOLE_AVEC_ENFANT", "liencommune": null, "orientation": false, "situationPro": null, "domiciliation": true, "accompagnement": false}	{}	new-decision	2020-11-01 01:00:00+01	\N	t	PREMIERE_DOM	\N	homme	1988-11-02 01:00:00+01
58984fa0-a3e5-4bb5-96ea-3cc680fea262	2022-03-17 12:34:17.714+01	2024-01-29 00:07:17.812469+01	1	6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	5	[]	{"uuid": "db8c8e7d-0300-48e3-a970-10588d410194", "motif": null, "statut": "INSTRUCTION", "dateFin": "2022-03-17T11:34:17.714Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2022-03-17T11:34:17.714Z", "orientation": null, "dateDecision": "2022-03-17T11:34:17.714Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{}	new-decision	2022-03-17 01:00:00+01	2022-03-17 00:59:59.999+01	f	PREMIERE_DOM	\N	homme	1960-02-12 01:00:00+01
a0b928ea-6467-4f49-ae74-8be471fc3e7e	2022-03-17 17:34:20.003+01	2024-01-29 00:07:17.818309+01	1	6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	5	[]	{"uuid": "db8c8e7d-0300-48e3-a970-10588d410194", "motif": null, "statut": "INSTRUCTION", "dateFin": "2022-03-17T11:34:17.714Z", "dateDebut": "2022-03-17T11:34:17.714Z", "orientation": null, "dateDecision": "2022-03-17T11:34:17.714Z"}	{"cause": null, "raison": null, "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{"dateRdv": "2022-03-17T16:33:19.998Z"}	update-rdv	2022-03-17 01:00:00+01	2022-03-17 00:59:59.999+01	f	PREMIERE_DOM	\N	homme	1960-02-12 01:00:00+01
28d543d5-089d-4e4c-a039-44ffe6d87922	2022-03-17 17:34:24.815+01	2024-01-29 00:07:17.822776+01	1	6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	5	[]	{"uuid": "db8c8e7d-0300-48e3-a970-10588d410194", "motif": null, "statut": "INSTRUCTION", "dateFin": "2022-03-17T11:34:17.714Z", "dateDebut": "2022-03-17T11:34:17.714Z", "orientation": null, "dateDecision": "2022-03-17T11:34:17.714Z"}	{"cause": "HEBERGE_SANS_ADRESSE", "raison": "EXERCICE_DROITS", "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{"dateRdv": "2022-03-17T16:33:19.998Z"}	update-entretien	2022-03-17 01:00:00+01	2022-03-16 00:59:59.999+01	f	PREMIERE_DOM	\N	homme	1960-02-12 01:00:00+01
9ab57f55-eeb9-4a02-be0a-c46e18e8974d	2022-03-17 12:34:29.96+01	2024-01-29 00:07:17.826585+01	1	6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	5	[]	{"motif": null, "statut": "VALIDE", "dateFin": "2023-03-15T22:59:59.999Z", "typeDom": "PREMIERE_DOM", "dateDebut": "2022-03-16T19:00:00.000Z", "orientation": null, "dateDecision": "2022-03-17T11:34:29.960Z"}	{"cause": "HEBERGE_SANS_ADRESSE", "raison": "EXERCICE_DROITS", "revenus": null, "residence": null, "typeMenage": null, "liencommune": null, "orientation": null, "situationPro": null, "domiciliation": null, "accompagnement": null}	{"dateRdv": "2022-03-17T16:33:19.998Z"}	new-decision	2022-03-16 01:00:00+01	\N	t	PREMIERE_DOM	\N	homme	1960-02-12 01:00:00+01
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
e0bcefc6-f1be-4c83-ac9d-6ea47335a9c3	2021-03-15 16:53:55.740856+01	2024-10-30 22:34:43.714323+01	9	1	1	\N	[{"date": "2024-10-30T21:34:43.713Z", "type": "login-success"}]
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

