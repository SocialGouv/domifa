--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 15.13

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

COPY public.app_log (uuid, "createdAt", "updatedAt", version, "userId", "usagerRef", "structureId", action, role, "createdBy", context) FROM stdin;
0c8c6826-9da4-45f0-a726-9faf11b01eee	2023-09-05 23:50:23.616466+02	2023-09-05 23:50:23.616466+02	1	1	1	1	SUPPRIMER_PIECE_JOINTE	\N	\N	\N
e8112a58-5cda-42ff-8bf6-6dd1ed92bcff	2023-12-18 17:54:10.818639+01	2023-12-18 17:54:10.818639+01	1	1	7	1	RESET_PASSWORD_PORTAIL	\N	\N	\N
448257b5-f24e-4b59-9955-00590cd8d42f	2023-12-18 17:54:12.343842+01	2023-12-18 17:54:12.343842+01	1	1	7	1	DOWNLOAD_PASSWORD_PORTAIL	\N	\N	\N
66859af4-96c7-41e0-9a68-9c8994acd79a	2024-10-30 22:35:13.095317+01	2024-10-30 22:35:13.095317+01	1	1	7	1	USAGERS_DOCS_UPLOAD	\N	\N	\N
\.


--
-- Data for Name: contact_support; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_support (uuid, "createdAt", "updatedAt", version, "userId", "structureId", content, attachment, email, name, "structureName", subject, phone) FROM stdin;
\.


--
-- Data for Name: expired_token; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expired_token (uuid, "createdAt", "updatedAt", version, "userId", "structureId", token, "userProfile") FROM stdin;
\.


--
-- Data for Name: structure; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.structure (uuid, "createdAt", "updatedAt", version, id, adresse, "adresseCourrier", agrement, capacite, "codePostal", "complementAdresse", departement, region, email, "hardReset", import, "registrationDate", "importDate", "lastLogin", nom, options, responsable, "structureType", ville, sms, "portailUsager", "timeZone", telephone, "acceptTerms", latitude, longitude, "organismeType", "departmentName", "regionName", reseau, "cityCode", "domicilieSegment", "populationSegment", "registrationData", siret, statut, decision) FROM stdin;
e159011b-6648-426d-a772-b3ca4f27a6d5	2021-01-26 08:51:53.846157+01	2025-11-06 20:34:50.282768+01	8	2	2 rue du test	\N	\N	\N	33600	\N	33	75	cias.test@yopmail.com	\N	f	2020-11-17 14:32:21.959+01	\N	2020-11-17	CIAS de Test	{"numeroBoite": false, "nomStructure": true}	{"nom": "Anna", "prenom": "Dupond", "fonction": "PDG"}	cias	Pessac	{"schedule": {"friday": false, "monday": false, "tuesday": true, "thursday": true, "wednesday": false}, "senderName": null, "senderDetails": null, "enabledByDomifa": false, "enabledByStructure": false}	{"enabledByDomifa": true, "enabledByStructure": false, "usagerLoginUpdateLastInteraction": false}	Europe/Paris	{"numero": "0102030405", "countryCode": "fr"}	\N	44.817602	-0.612957	\N	Gironde	Nouvelle-Aquitaine	\N	33318	VERY_SMALL	\N	\N	\N	VALIDE	{"uuid": "89c17020-99fe-48e0-ac94-90fbe121bd26", "motif": null, "statut": "VALIDE", "userId": 1, "userName": "Migration DomiFa", "dateDecision": "2025-11-06T19:34:50.259Z", "motifDetails": null}
943d3acc-2f9c-4bb4-9419-4194bbdfd624	2022-03-17 17:25:53.666507+01	2025-11-06 20:34:50.282768+01	41	5	24, avenue Louis PASTEUR	{"actif": false, "ville": null, "adresse": null, "codePostal": ""}		\N	97300	\N	973	03	ccas-cayenne@yopmail.com	\N	f	2022-03-17 17:25:53.646+01	\N	2022-03-23	CCAS de Cayenne	{"numeroBoite": false, "nomStructure": true}	{"nom": "Pali", "prenom": "Mauricette", "fonction": "Directrice"}	cias	Cayenne	{"schedule": {"friday": false, "monday": false, "tuesday": true, "thursday": true, "wednesday": false}, "senderName": "CCAS DE CAY", "senderDetails": "CCAS DE CAY", "enabledByDomifa": true, "enabledByStructure": false}	{"enabledByDomifa": true, "enabledByStructure": false, "usagerLoginUpdateLastInteraction": false}	America/Cayenne	{"numero": "0101010101", "countryCode": "gf"}	\N	4.943454	-52.324458	\N	Guyane	Guyane	\N	97302	VERY_SMALL	\N	\N	\N	VALIDE	{"uuid": "89c17020-99fe-48e0-ac94-90fbe121bd26", "motif": null, "statut": "VALIDE", "userId": 1, "userName": "Migration DomiFa", "dateDecision": "2025-11-06T19:34:50.259Z", "motifDetails": null}
610966c4-ab91-43c0-88da-483ae23d0af2	2021-02-01 17:12:30.65884+01	2025-11-06 20:34:50.282768+01	14	4	rue de l'import	{"actif": false, "ville": "", "adresse": "", "codePostal": ""}	123	\N	44000		44	52	test.import@yopmail.com	\N	f	2021-02-01 17:12:30.655+01	\N	\N	Structure de Test d'import	{"numeroBoite": false, "nomStructure": true}	{"nom": "Test", "prenom": "Import", "fonction": "Testeur"}	asso	Nantes	{"schedule": {"friday": false, "monday": false, "tuesday": true, "thursday": true, "wednesday": false}, "senderName": "STRUCTURE D", "senderDetails": "STRUCTURE D", "enabledByDomifa": true, "enabledByStructure": false}	{"enabledByDomifa": true, "enabledByStructure": false, "usagerLoginUpdateLastInteraction": false}	Europe/Paris	{"numero": "0101010101", "countryCode": "fr"}	\N	47.213973	-1.536923	\N	Loire-Atlantique	Pays de la Loire	Autre réseau	44109	VERY_SMALL	\N	\N	\N	VALIDE	{"uuid": "89c17020-99fe-48e0-ac94-90fbe121bd26", "motif": null, "statut": "VALIDE", "userId": 1, "userName": "Migration DomiFa", "dateDecision": "2025-11-06T19:34:50.259Z", "motifDetails": null}
1d1ed6f0-7674-474a-908b-d0bd8c6389cb	2021-01-26 08:51:53.846157+01	2025-11-06 20:34:50.282768+01	10	3	1 rue du test de l'organise agréé	\N	1234	80	44000	\N	44	52	structure@yopmail.com	{"token": "6V0XR2S", "userId": 3}	t	2020-11-17 14:34:35.821+01	\N	2021-12-06	Organisme agréé de Test	{"numeroBoite": false, "nomStructure": true}	{"nom": "Calvez", "prenom": "Simon", "fonction": "Directeur"}	asso	Nantes	{"schedule": {"friday": false, "monday": false, "tuesday": true, "thursday": true, "wednesday": false}, "senderName": null, "senderDetails": null, "enabledByDomifa": false, "enabledByStructure": false}	{"enabledByDomifa": true, "enabledByStructure": false, "usagerLoginUpdateLastInteraction": false}	Europe/Paris	{"numero": "0506070809", "countryCode": "fr"}	\N	47.218193	-1.561368	\N	Loire-Atlantique	Pays de la Loire	Autre réseau	44109	VERY_SMALL	\N	\N	\N	VALIDE	{"uuid": "89c17020-99fe-48e0-ac94-90fbe121bd26", "motif": null, "statut": "VALIDE", "userId": 1, "userName": "Migration DomiFa", "dateDecision": "2025-11-06T19:34:50.259Z", "motifDetails": null}
412f6962-fc6e-4e48-b0a6-a37d6eebbc67	2021-01-26 08:51:53.846157+01	2025-11-06 20:34:50.282768+01	375	1	1 rue de l'océan	\N	\N	\N	92600	\N	92	11	ccas.test@yopmail.com	\N	f	2020-11-17 14:30:23.692+01	\N	2025-09-18	CCAS de Test	{"numeroBoite": false, "nomStructure": true}	{"nom": "Jean", "prenom": "Thomson", "fonction": "PDG"}	ccas	Asnieres-sur-seine	{"schedule": {"friday": false, "monday": false, "tuesday": true, "thursday": true, "wednesday": false}, "senderName": "CCAS DE TES", "senderDetails": "CCAS DE TES", "enabledByDomifa": true, "enabledByStructure": false}	{"enabledByDomifa": true, "enabledByStructure": true, "usagerLoginUpdateLastInteraction": false}	Europe/Paris	{"numero": "0602030405", "countryCode": "fr"}	2023-02-14 18:33:51.265+01	48.903759	2.283746	\N	Hauts-de-Seine	Île-de-France	\N	92004	VERY_SMALL	\N	\N	\N	VALIDE	{"uuid": "89c17020-99fe-48e0-ac94-90fbe121bd26", "motif": null, "statut": "VALIDE", "userId": 1, "userName": "Migration DomiFa", "dateDecision": "2025-11-06T19:34:50.259Z", "motifDetails": null}
\.


--
-- Data for Name: usager; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usager (uuid, "createdAt", "updatedAt", version, ref, "customRef", "structureId", nom, prenom, surnom, sexe, "dateNaissance", "villeNaissance", langue, email, "datePremiereDom", "typeDom", decision, historique, "ayantsDroits", "lastInteraction", "etapeDemande", rdv, options, import, migrated, telephone, "contactByPhone", "numeroDistribution", "pinnedNote", nationalite, statut, nom_prenom_surnom_ref, "referrerId") FROM stdin;
16fe01bb-0c4d-4836-a24a-07d117b47fb9	2021-11-30 15:02:59.193913+01	2022-12-19 11:29:56.621829+01	5	9	9	1	TOMOU	Papah		homme	2001-11-03 01:00:00+01	Paris	\N		\N	PREMIERE_DOM	{"uuid": "c46924e6-fc2a-47d6-955c-8f7cabae70e3", "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-11-30T14:02:59.189Z", "userName": "Patrick Roméro", "dateDecision": "2021-11-30T14:02:59.189Z"}	[{"uuid": "c46924e6-fc2a-47d6-955c-8f7cabae70e3", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-11-30T14:02:59.189Z", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-11-30T14:02:59.189Z", "motifDetails": null, "orientationDetails": null}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2021-11-30T14:02:59.187Z"}	2	\N	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N	\N	INSTRUCTION	tomou papah 9	\N
a034b69a-210a-4a3d-b7a9-8987840ef0c7	2021-11-30 15:03:28.817939+01	2023-05-24 17:51:40.763319+02	6	10	10	1	Dupan	Tom		homme	1988-02-02 01:00:00+01	Marseille	\N		\N	PREMIERE_DOM	{"uuid": "fbe59327-0fef-4d74-ade1-97120407f43c", "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-11-30T14:03:28.817Z", "userName": "Patrick Roméro", "dateDecision": "2021-11-30T14:03:28.817Z"}	[{"uuid": "fbe59327-0fef-4d74-ade1-97120407f43c", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-11-30T14:03:28.817Z", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-11-30T14:03:28.817Z", "motifDetails": null, "orientationDetails": null}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2021-11-30T14:03:28.816Z"}	2	\N	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	{"message": "2eme note", "createdAt": "2023-05-24T15:51:38.893Z", "createdBy": {"userId": 1, "userName": "Patrick Roméro"}, "usagerRef": 10}	\N	INSTRUCTION	dupan tom 10	\N
427e6af6-706b-40d4-9506-de21190e6f0d	2021-01-27 10:21:49.173276+01	2022-12-19 11:29:56.621829+01	7	4	4	1	Loumiel	Lisa	Lilou	femme	1990-04-18 02:00:00+02	Marseille	\N	\N	2019-08-09 02:00:00+02	PREMIERE_DOM	{"uuid": "0c3f2589-d5d3-4138-a4bc-2a594678461e", "motif": "NON_RESPECT_REGLEMENT", "statut": "RADIE", "userId": 1, "dateFin": "2019-09-12T00:00:00.000Z", "typeDom": "PREMIERE", "userName": "Patrick Roméro", "dateDebut": "2019-08-09T00:00:00.000Z", "orientation": "", "dateDecision": "2019-09-12T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[{"uuid": "0c3f2589-d5d3-4138-a4bc-2a594678461e", "motif": "NON_RESPECT_REGLEMENT", "statut": "RADIE", "userId": 1, "dateFin": "2019-09-12T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2019-08-09T00:00:00.000Z", "orientation": null, "dateDecision": "2019-09-12T00:00:00.000Z", "motifDetails": null, "orientationDetails": null}]	[]	{"appel": null, "visite": null, "colisIn": 0, "enAttente": false, "courrierIn": 0, "nbCourrier": 0, "courrierOut": null, "recommandeIn": 0, "recommandeOut": null, "dateInteraction": "2021-01-27T09:21:49.240Z"}	5	\N	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "0606060606", "countryCode": "FR"}	f	\N	\N	\N	RADIE	loumiel lisa lilou 4	\N
e074c416-093a-46fc-ae47-77a3bc111d35	2021-01-27 10:21:49.173276+01	2022-12-19 11:29:56.621829+01	6	3	3	1	Dupont	Fred	fredo	homme	1940-08-07 02:00:00+02	Macon	\N	\N	2019-10-07 20:50:25.552+02	PREMIERE_DOM	{"uuid": "30ababd0-8e2f-4917-9662-9c812d604dda", "motif": "SATURATION", "statut": "REFUS", "userId": 1, "dateFin": "2020-08-09T00:00:00.000Z", "typeDom": "PREMIERE", "userName": "Patrick Roméro", "dateDebut": "2019-09-12T00:00:00.000Z", "orientation": "", "dateDecision": "2019-09-12T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[{"uuid": "30ababd0-8e2f-4917-9662-9c812d604dda", "motif": "SATURATION", "statut": "REFUS", "userId": 1, "dateFin": "2020-08-09T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2019-09-12T00:00:00.000Z", "orientation": null, "dateDecision": "2019-09-12T00:00:00.000Z", "motifDetails": null, "orientationDetails": null}]	[]	{"appel": null, "visite": null, "colisIn": 0, "enAttente": false, "courrierIn": 0, "nbCourrier": 0, "courrierOut": null, "recommandeIn": 0, "recommandeOut": null, "dateInteraction": "2021-01-27T09:21:49.237Z"}	5	\N	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N	\N	REFUS	dupont fred fredo 3	\N
97b7e840-0e93-4bf4-ba7d-0a406aa898f2	2019-11-22 11:33:43+01	2022-12-19 11:29:56.621829+01	536	2	63	1	Karamoko	Maurice	\N	homme	1998-08-07 02:00:00+02	Bouaké, Côte d'Ivoire	\N	domicilie2@yopmail.com	2018-01-11 01:00:00+01	RENOUVELLEMENT	{"uuid": "178ad317-0bd1-41e7-ad87-fd371f166310", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2020-02-12T00:00:00.000Z", "typeDom": "RENOUVELLEMENT", "userName": "Patrick Roméro", "dateDebut": "2019-02-12T00:00:00.000Z", "orientation": "", "dateDecision": "2019-02-12T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[{"uuid": "178ad317-0bd1-41e7-ad87-fd371f166310", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2020-02-12T00:00:00.000Z", "typeDom": "RENOUVELLEMENT", "userName": "Patrick Roméro", "dateDebut": "2019-02-12T00:00:00.000Z", "orientation": null, "dateDecision": "2019-02-12T00:00:00.000Z", "motifDetails": null, "orientationDetails": null}]	[{"nom": "Karamoko", "lien": "CONJOINT", "prenom": "Mauricette", "dateNaissance": "1978-12-20T00:00:00.000Z"}]	{"colisIn": 3, "enAttente": true, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2020-12-01T10:00:24.980Z"}	3	\N	{"npai": {"actif": false}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [{"nom": "Milani", "prenom": "Marcel", "dateFin": "2022-06-05T00:00:00.000Z", "dateDebut": "2021-10-01T00:00:00.000Z", "dateNaissance": "1983-03-17T00:00:00.000Z"}], "portailUsagerEnabled": true}	\N	t	{"numero": "0606060606", "countryCode": "FR"}	f	\N	\N	\N	VALIDE	karamoko maurice 2	\N
860ffa4c-88c4-4e1c-ad42-5a05cdf39830	2019-11-22 11:33:43+01	2022-12-19 11:29:56.621829+01	9	1	63	1	Ramirez	Marta	\N	femme	1978-08-07 02:00:00+02	Sao Paulo, Brésil	\N	domicilie1@yopmail.com	2018-03-01 01:00:00+01	PREMIERE_DOM	{"uuid": "52ba789e-eb21-4d84-9176-abe1e0d3c778", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2019-02-27T00:00:00.000Z", "typeDom": "PREMIERE", "userName": "Patrick Roméro", "dateDebut": "2018-03-01T00:00:00.000Z", "orientation": "", "dateDecision": "2018-03-01T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[{"uuid": "52ba789e-eb21-4d84-9176-abe1e0d3c778", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2019-02-27T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2018-03-01T00:00:00.000Z", "orientation": null, "dateDecision": "2018-03-01T00:00:00.000Z", "motifDetails": null, "orientationDetails": null}]	[{"nom": "Martinez", "lien": "ENFANT", "prenom": "Luiz", "dateNaissance": "1992-12-20T00:00:00.000Z"}, {"nom": "Martinez", "lien": "ENFANT", "prenom": "Sylvia", "dateNaissance": "2007-10-20T00:00:00.000Z"}]	{"colisIn": 4, "enAttente": true, "courrierIn": 1, "recommandeIn": 3, "dateInteraction": "2020-07-29T11:46:34.680Z"}	5	\N	{"npai": {"actif": false}, "transfert": {"nom": "LHSS Plaisance", "actif": true, "adresse": "12 rue ridder 75014 Paris", "dateFin": "2020-11-07T00:00:00.000Z", "dateDebut": "2020-06-03T12:20:00.603Z"}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "0600000000", "countryCode": "FR"}	f	\N	\N	\N	VALIDE	ramirez marta 1	\N
274427da-7482-4edb-86aa-4afaf48243d5	2021-11-30 15:04:46.21552+01	2025-09-25 21:55:01.578559+02	10	11	11	1	Saura	Sophie		homme	1999-08-20 02:00:00+02	Lyon	\N		\N	PREMIERE_DOM	{"statut": "ATTENTE_DECISION", "userId": 1, "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-11-30T14:04:56.881Z", "dateDecision": "2021-11-30T14:04:56.881Z"}	[{"uuid": "73cb88b5-c4bf-42ee-b6db-2f6f32d4fbc3", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-11-30T14:04:46.214Z", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-11-30T14:04:46.214Z", "motifDetails": null, "orientationDetails": null}, {"uuid": "39943ba1-71e9-4326-84cd-9464dbf9b71a", "motif": null, "statut": "ATTENTE_DECISION", "userId": 1, "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-11-30T14:04:56.881Z", "motifDetails": null, "orientationDetails": null}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2021-11-30T14:04:46.212Z"}	4	{"userId": 1, "dateRdv": "2021-11-30T14:03:48.988Z", "userName": "Patrick Roméro"}	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N	\N	ATTENTE_DECISION	saura sophie 11	\N
ee7ef219-b101-422c-8ad4-4d5aedf9caad	2020-11-01 18:50:10.047+01	2022-12-19 11:29:56.621829+01	8	6	6	1	NOUVEAU	DOSSIER	TEST	homme	1988-11-02 01:00:00+01	Paris	\N	fake-mail@yopmail.com	2020-11-01 01:00:00+01	PREMIERE_DOM	{"uuid": "bf35d476-35d6-4d3d-93b4-dfd49816904f", "statut": "VALIDE", "userId": 1, "dateFin": "2021-10-31T00:00:00.000Z", "userName": "Patrick Roméro", "dateDebut": "2020-11-01T00:00:00.000Z", "dateDecision": "2020-11-01T17:50:29.003Z", "orientationDetails": null}	[{"uuid": "8bd1eae7-7635-4c75-ba64-ad78b1141baf", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2020-11-01T17:50:10.042Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2020-11-01T17:50:10.042Z", "orientation": null, "dateDecision": "2020-11-01T17:50:10.042Z", "motifDetails": null, "orientationDetails": null}, {"uuid": "bf35d476-35d6-4d3d-93b4-dfd49816904f", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2021-10-31T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2020-11-01T00:00:00.000Z", "orientation": null, "dateDecision": "2020-11-01T17:50:29.003Z", "motifDetails": null, "orientationDetails": null}]	[{"nom": "TEST 1 ", "lien": "PARENT", "prenom": "TEST 2 ", "dateNaissance": "1991-12-20T00:00:00.000Z"}]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2020-11-01T00:00:00.000Z"}	5	{"userId": 1, "dateRdv": "2020-11-01T17:50:12.019Z", "userName": "Roméro Patrick"}	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "0600000000", "countryCode": "FR"}	f	\N	\N	\N	VALIDE	nouveau dossier test 6	\N
4dcdcddc-fad2-4827-aac5-0acf1df7b5bc	2021-01-27 10:21:49.173276+01	2022-12-19 11:29:56.621829+01	7	5	5	1	Derick	Inspecteur	\N	homme	1911-05-24 00:00:00+00	Bergerac	\N	\N	\N	PREMIERE_DOM	{"uuid": "c6aabd3b-7485-4efd-8c09-5080b91709d9", "statut": "ATTENTE_DECISION", "userId": 2, "dateFin": "2021-01-27T09:21:49.242Z", "userName": "Isabelle Juste", "dateDecision": "2019-10-07T19:28:10.777Z", "orientationDetails": null}	[{"uuid": "6f18c8d5-27b7-45c5-882d-e23876a3b1ed", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2020-10-07T18:52:09.797Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2019-10-07T18:52:09.797Z", "orientation": null, "dateDecision": "2019-10-07T18:53:06.510Z", "motifDetails": null, "orientationDetails": null}, {"uuid": "c6aabd3b-7485-4efd-8c09-5080b91709d9", "motif": null, "statut": "ATTENTE_DECISION", "userId": 2, "dateFin": "2021-01-27T09:21:49.242Z", "typeDom": "PREMIERE_DOM", "userName": "Isabelle Juste", "dateDebut": "2019-10-07T19:28:10.777Z", "orientation": null, "dateDecision": "2019-10-07T19:28:10.777Z", "motifDetails": null, "orientationDetails": null}]	[{"nom": "Inspecteur", "lien": "ENFANT", "prenom": "Gadget", "dateNaissance": "1990-10-12T00:00:00.000Z"}]	{"appel": null, "visite": null, "colisIn": 0, "enAttente": false, "courrierIn": 0, "nbCourrier": 0, "courrierOut": null, "recommandeIn": 0, "recommandeOut": null, "dateInteraction": "2021-01-27T09:21:49.242Z"}	0	{"userId": 2, "dateRdv": "2019-10-07T19:30:02.675Z", "userName": "Juste Isabelle"}	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N	\N	ATTENTE_DECISION	derick inspecteur 5	\N
3ba5c3f0-8003-4c1c-8bf5-929a12e396f5	2021-11-30 15:05:21.635622+01	2025-09-25 21:55:01.578559+02	11	12	12	1	Rara	Dié		homme	1975-08-08 01:00:00+01	Nantes	\N		2021-11-30 01:00:00+01	PREMIERE_DOM	{"motif": "A_SA_DEMANDE", "statut": "RADIE", "userId": 1, "dateFin": "2021-11-30T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-11-30T00:00:00.000Z", "dateDecision": "2021-11-30T14:05:41.678Z", "motifDetails": null}	[{"uuid": "e8e8c681-9151-4335-8e1c-4e9140946b02", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-11-30T14:05:21.634Z", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-11-30T14:05:21.634Z", "motifDetails": null, "orientationDetails": null}, {"uuid": "cbbc07fd-7bea-4ab1-9712-47c4901f25d1", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2022-11-29T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "customRef": "12", "dateDebut": "2021-11-30T00:00:00.000Z", "orientation": null, "dateDecision": "2021-11-30T14:05:31.936Z", "motifDetails": null, "orientationDetails": null}, {"uuid": "8e6fd804-34fe-4930-8c79-94bc6f9ac054", "motif": "A_SA_DEMANDE", "statut": "RADIE", "userId": 1, "dateFin": "2021-11-30T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-11-30T00:00:00.000Z", "orientation": null, "dateDecision": "2021-11-30T14:05:41.678Z", "motifDetails": null, "orientationDetails": null}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2021-11-30T14:05:21.631Z"}	5	{"userId": 1, "dateRdv": "2021-11-30T14:04:24.108Z", "userName": "Patrick Roméro"}	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N	\N	RADIE	rara die 12	\N
5215f197-5f9b-4c2a-8b2e-60a0fcc5fc85	2021-06-28 15:26:31.533838+02	2025-09-25 21:55:01.578559+02	10	8	8	1	Smith	John		homme	2000-03-15 01:00:00+01	Londres	\N		\N	PREMIERE_DOM	{"motif": "LIEN_COMMUNE", "statut": "REFUS", "userId": 1, "dateFin": "2021-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-06-28T00:00:00.000Z", "orientation": "asso", "dateDecision": "2021-06-28T13:27:25.493Z", "motifDetails": null, "orientationDetails": "CCAS de sa commune"}	[{"uuid": "6d781a28-a5dc-4d95-826d-6aa0f78e5864", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-06-28T13:26:31.533Z", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-06-28T13:26:31.533Z", "motifDetails": null, "orientationDetails": null}, {"uuid": "155ea62c-3ac2-4068-87ea-0a178c25666b", "motif": "LIEN_COMMUNE", "statut": "REFUS", "userId": 1, "dateFin": "2021-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-06-28T00:00:00.000Z", "orientation": "asso", "dateDecision": "2021-06-28T13:27:25.493Z", "motifDetails": null, "orientationDetails": "CCAS de sa commune"}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2021-06-28T13:26:31.530Z"}	5	{"userId": 1, "dateRdv": "2021-06-28T13:25:42.151Z", "userName": "Patrick Roméro"}	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N	\N	REFUS	smith john 8	\N
6d93ecf8-c59a-42cc-ac1e-b5bd6f977a01	2022-03-17 17:34:17.752334+01	2025-09-25 21:55:01.578559+02	79	1	1	5	Salvador	Henri	\N	homme	1960-02-12 01:00:00+01	Cayenne	\N	\N	2022-03-16 20:00:00+01	PREMIERE_DOM	{"statut": "VALIDE", "userId": 11, "dateFin": "2023-03-15T22:59:59.999Z", "typeDom": "PREMIERE_DOM", "userName": "Mauricette Pali", "customRef": "1", "dateDebut": "2022-03-16T19:00:00.000Z", "dateDecision": "2022-03-17T11:34:29.960Z"}	[{"uuid": "db8c8e7d-0300-48e3-a970-10588d410194", "motif": null, "statut": "INSTRUCTION", "userId": 11, "dateFin": "2022-03-17T11:34:17.714Z", "userName": "Mauricette Pali", "dateDebut": "2022-03-17T11:34:17.714Z", "orientation": null, "dateDecision": "2022-03-17T11:34:17.714Z", "motifDetails": null, "orientationDetails": null}, {"uuid": "a0fc608c-adab-4ebc-979b-fb03af1d5537", "motif": null, "statut": "VALIDE", "userId": 11, "dateFin": "2023-03-15T22:59:59.999Z", "typeDom": "PREMIERE_DOM", "userName": "Mauricette Pali", "customRef": "1", "dateDebut": "2022-03-16T19:00:00.000Z", "orientation": null, "dateDecision": "2022-03-17T11:34:29.960Z", "motifDetails": null, "orientationDetails": null}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2020-12-01T05:00:24.980Z"}	5	{"userId": 11, "dateRdv": "2022-03-17T16:33:19.998Z", "userName": "Mauricette Pali"}	{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "procurations": [], "portailUsagerEnabled": false}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N	\N	VALIDE	salvador henri 1	\N
b2c26e55-ab37-457d-b307-6fe161050a9b	2021-06-28 15:24:22.924091+02	2025-09-25 21:55:01.578559+02	38	7	7	1	Dupont	Pauline	Paula	homme	1996-01-02 01:00:00+01	Paris	fr		2021-06-28 02:00:00+02	PREMIERE_DOM	{"statut": "VALIDE", "userId": 1, "dateFin": "2022-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-06-28T00:00:00.000Z", "dateDecision": "2021-06-28T13:25:20.685Z"}	[{"uuid": "db7ff8b2-66e3-47ee-9346-e080945b418e", "motif": null, "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-06-28T13:24:22.920Z", "userName": "Patrick Roméro", "orientation": null, "dateDecision": "2021-06-28T13:24:22.920Z", "motifDetails": null, "orientationDetails": null}, {"uuid": "5f7dbaf0-1bc2-460f-926c-258ab86f9bd8", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2022-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-06-28T00:00:00.000Z", "orientation": null, "dateDecision": "2021-06-28T13:25:20.685Z", "motifDetails": null, "orientationDetails": null}]	[{"nom": "Dupont", "lien": "ENFANT", "prenom": "Paulin", "dateNaissance": "2015-08-15T00:00:00.000Z"}, {"nom": "Dupont", "lien": "ENFANT", "prenom": "Sophie", "dateNaissance": "2018-12-03T00:00:00.000Z"}]	{"colisIn": 1, "enAttente": true, "courrierIn": 2, "recommandeIn": 0, "dateInteraction": "2021-06-28T13:25:36.004Z"}	5	{"userId": 1, "dateRdv": "2021-06-28T13:23:27.041Z", "userName": "Patrick Roméro"}	{"npai": {"actif": false}, "transfert": {"actif": false}, "procurations": [], "portailUsagerEnabled": true}	\N	t	{"numero": "", "countryCode": "FR"}	f	\N	\N	\N	VALIDE	dupont pauline paula 7	\N
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
-- Data for Name: open_data_cities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.open_data_cities (uuid, "createdAt", "updatedAt", version, "regionCode", region, "departmentCode", department, city, "cityCode", "postalCode", population, areas, "populationSegment") FROM stdin;
\.


--
-- Data for Name: open_data_places; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.open_data_places (uuid, "createdAt", "updatedAt", version, nom, adresse, "complementAdresse", ville, "codePostal", departement, region, latitude, longitude, source, software, mail, "structureType", "domifaStructureId", "soliguideStructureId", "mssId", "nbDomicilies", "nbDomiciliesDomifa", "nbAttestations", "nbAttestationsDomifa", saturation, "saturationDetails", "dgcsId", reseau, "domicilieSegment", "cityCode", "populationSegment") FROM stdin;
\.


--
-- Data for Name: public_stats_cache; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.public_stats_cache (uuid, "createdAt", "updatedAt", version, key, stats) FROM stdin;
58463f81-6539-40e4-8dd4-3a545ebbfc59	2025-03-04 14:17:21.654195+01	2025-03-04 14:17:21.654195+01	1	public-stats-52	{"actifs": 11, "usersCount": 5, "usagersCount": 0, "courrierInCount": 0, "structuresCount": 2, "courrierOutCount": 0, "usagersCountByMonth": [{"name": "août", "value": 0}, {"name": "sept.", "value": 0}, {"name": "oct.", "value": 0}, {"name": "nov.", "value": 0}, {"name": "déc.", "value": 0}, {"name": "janv.", "value": 0}, {"name": "févr.", "value": 0}, {"name": "mars", "value": 0}, {"name": "avr.", "value": 0}, {"name": "mai", "value": 0}, {"name": "juin", "value": 0}, {"name": "juil.", "value": 0}], "structuresCountByRegion": [{"count": 2, "region": "44"}], "interactionsCountByMonth": [{"name": "août", "value": 0}, {"name": "sept.", "value": 0}, {"name": "oct.", "value": 0}, {"name": "nov.", "value": 0}, {"name": "déc.", "value": 0}, {"name": "janv.", "value": 0}, {"name": "févr.", "value": 0}, {"name": "mars", "value": 0}, {"name": "avr.", "value": 0}, {"name": "mai", "value": 0}, {"name": "juin", "value": 0}, {"name": "juil.", "value": 0}], "structuresCountByTypeMap": {"asso": 2, "ccas": 0, "cias": 0}}
daee63de-0948-45bc-91c5-6ca1bcc1de5a	2025-03-04 14:17:42.44746+01	2025-03-04 14:17:42.44746+01	1	public-stats	{"actifs": 11, "usersCount": 10, "usagersCount": 20, "courrierInCount": 5, "structuresCount": 5, "courrierOutCount": 2, "usagersCountByMonth": [{"name": "août", "value": 0}, {"name": "sept.", "value": 0}, {"name": "oct.", "value": 0}, {"name": "nov.", "value": 4}, {"name": "déc.", "value": 0}, {"name": "janv.", "value": 0}, {"name": "févr.", "value": 0}, {"name": "mars", "value": 1}, {"name": "avr.", "value": 0}, {"name": "mai", "value": 0}, {"name": "juin", "value": 0}, {"name": "juil.", "value": 0}], "structuresCountByRegion": [{"count": 2, "region": "52"}, {"count": 1, "region": "03"}, {"count": 1, "region": "11"}, {"count": 1, "region": "75"}], "interactionsCountByMonth": [{"name": "août", "value": 0}, {"name": "sept.", "value": 0}, {"name": "oct.", "value": 0}, {"name": "nov.", "value": 0}, {"name": "déc.", "value": 0}, {"name": "janv.", "value": 0}, {"name": "févr.", "value": 0}, {"name": "mars", "value": 0}, {"name": "avr.", "value": 0}, {"name": "mai", "value": 0}, {"name": "juin", "value": 0}, {"name": "juil.", "value": 0}], "structuresCountByTypeMap": {"asso": 2, "ccas": 1, "cias": 2}}
4e606c99-452e-4df7-9242-46c945dd7dff	2025-03-06 00:34:20.797777+01	2025-03-06 00:34:20.797777+01	1	public-stats	{"actifs": 11, "usersCount": 11, "usagersCount": 20, "courrierInCount": 5, "structuresCount": 5, "courrierOutCount": 2, "usagersCountByMonth": [{"name": "mars", "value": 0}, {"name": "avr.", "value": 0}, {"name": "mai", "value": 0}, {"name": "juin", "value": 0}, {"name": "juil.", "value": 0}, {"name": "août", "value": 0}, {"name": "sept.", "value": 0}, {"name": "oct.", "value": 0}, {"name": "nov.", "value": 0}, {"name": "déc.", "value": 0}, {"name": "janv.", "value": 0}, {"name": "févr.", "value": 0}], "structuresCountByRegion": [{"count": 2, "region": "52"}, {"count": 1, "region": "03"}, {"count": 1, "region": "11"}, {"count": 1, "region": "75"}], "interactionsCountByMonth": [{"name": "mars", "value": 0}, {"name": "avr.", "value": 0}, {"name": "mai", "value": 0}, {"name": "juin", "value": 0}, {"name": "juil.", "value": 0}, {"name": "août", "value": 0}, {"name": "sept.", "value": 0}, {"name": "oct.", "value": 0}, {"name": "nov.", "value": 0}, {"name": "déc.", "value": 0}, {"name": "janv.", "value": 0}, {"name": "févr.", "value": 0}], "structuresCountByTypeMap": {"asso": 2, "ccas": 1, "cias": 2}}
\.


--
-- Data for Name: structure_doc; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.structure_doc (uuid, "createdAt", "updatedAt", version, id, label, "createdBy", custom, filetype, "structureId", path, "customDocType", "displayInPortailUsager", "encryptionContext", "encryptionVersion") FROM stdin;
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
\.


--
-- Data for Name: typeorm_metadata; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.typeorm_metadata (type, schema, name, value) FROM stdin;
\.


--
-- Data for Name: usager_docs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usager_docs (uuid, "createdAt", "updatedAt", version, "usagerUUID", "structureId", "usagerRef", path, label, filetype, "createdBy", "encryptionContext", "encryptionVersion", shared, filesize) FROM stdin;
2eb5e74d-4b25-4aa6-ad2a-7d963ae66072	2019-10-07 20:51:31.578+02	2025-09-25 21:55:02.853423+02	2	860ffa4c-88c4-4e1c-ad42-5a05cdf39830	1	1	373144a3d9d0b3f4c84bd527a5cff880.jpg	CNI	image/jpeg	Patrick Roméro	ffe17c48-7a1a-42c9-8494-0b72ca8b3686	0	f	-1
a77729a9-1b28-4090-bda8-760590bff982	2019-10-07 20:53:32.922+02	2025-09-25 21:55:02.997788+02	2	4dcdcddc-fad2-4827-aac5-0acf1df7b5bc	1	5	8242ba1bc7f3c3971f761b6a347fc1c4.jpg	Carte identité	image/jpeg	Patrick Roméro	ffe17c48-7a1a-42c9-8494-0b72ca8b3686	0	f	-1
542a0da1-ea1c-48ab-8026-67a4248b1c47	2024-10-30 22:35:12.346+01	2025-09-25 21:55:03.060835+02	2	b2c26e55-ab37-457d-b307-6fe161050a9b	1	7	ddda9bf211821bec99b90230bd0f52dc.jpg	Document à éditer par la suite	image/jpeg	Patrick Roméro	f36cb085-f3a5-4333-afbf-ba6c1c28c5d8	0	f	-1
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
-- Data for Name: user_structure; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_structure (uuid, "createdAt", "updatedAt", version, email, fonction, id, "lastLogin", nom, password, prenom, role, "structureId", mails, "passwordLastUpdate", verified, "acceptTerms", "fonctionDetail") FROM stdin;
663b9baa-2880-406c-a93a-32fe65528037	2020-11-17 14:18:47.658346+01	2020-11-17 14:18:47.658346+01	1	s1-instructeur@yopmail.com	\N	2	\N	Juste	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Isabelle	simple	1	{"guide": false, "import": false}	\N	t	\N	\N
59c846d8-0592-4790-a5e2-1daae9b8776e	2020-11-14 14:18:27.658736+01	2020-11-14 14:18:27.658736+01	1	s1-facteur@yopmail.com	\N	6	2021-06-28 15:27:26.095+02	Dupuis	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Facteur 1	facteur	1	{"guide": true, "import": true}	\N	t	\N	\N
d81c5566-94f9-4ee4-ab57-a604a654f79b	2020-11-17 14:32:22.193933+01	2020-11-17 14:39:14.015103+01	17	s3-admin@yopmail.com	\N	5	2020-11-17 14:39:13.796+01	Roseline	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Parmentier	admin	3	{"guide": false, "import": false}	2020-11-17 14:39:14.013+01	t	\N	\N
d19ece1f-d32b-498c-9427-eb12b1251163	2020-11-17 14:26:29.482634+01	2020-11-17 14:26:29.490297+01	2	s3-facteur@yopmail.com	\N	4	\N	Test	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Facteur	facteur	3	{"guide": false, "import": false}	\N	t	\N	\N
b0140303-79e3-436c-9c41-1eaefeeaed6e	2020-11-17 14:23:20.248011+01	2022-03-09 00:20:21.36073+01	9	s1-gestionnaire@yopmail.com	\N	3	2022-03-09 00:20:21.356+01	Smith	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Peter	responsable	1	{"guide": false, "import": false}	\N	t	\N	\N
343b62db-6c85-4896-b994-18c8c89b710f	2022-03-17 17:25:53.798318+01	2022-03-23 22:08:39.505536+01	36	s5-admin@yopmail.com	\N	11	2022-03-23 22:08:39.502+01	Pali	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Mauricette	admin	5	{"guide": false, "import": false}	2022-03-17 17:25:53.78+01	t	\N	\N
da01f451-9c4f-4f6c-98bb-c635277e33e7	2020-11-17 14:18:47.658346+01	2024-10-30 22:34:43.742052+01	392	preprod.domifa@fabrique.social.gouv.fr	\N	1	2024-10-30 22:34:43.742+01	Roméro	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Patrick	admin	1	{"guide": false, "import": false}	\N	t	2023-02-14 18:33:51.261+01	\N
4e049e3d-bb65-48e5-8661-b1ccdc9db985	2021-09-21 00:03:26.186917+02	2025-07-18 19:04:01.796244+02	3	s3-instructeur@yopmail.com	AUTRE	8	\N	Jacquet	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Aimé	simple	3	{"guide": false, "import": false}	\N	t	\N	\N
44f1cfe8-eae9-49d5-aedb-76dda856c413	2021-02-01 17:12:30.90825+01	2025-07-18 19:04:01.813538+02	3	s4-admin@yopmail.com	AUTRE	7	\N	Test	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Import	admin	4	{"guide": false, "import": false}	\N	t	\N	\N
f6b20e00-77e7-46e6-b48d-8cca69161042	2020-11-17 14:32:22.193+01	2025-07-18 19:04:01.814984+02	5	s3-gestionnaire@yopmail.com	DIRECTEUR_RESPONSABLE	10	2021-12-06 16:26:01.365+01	Etchebest	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Philippe	responsable	3	{"guide": false, "import": false}	\N	t	\N	\N
132e6e51-1612-44cc-b277-eca0a6d11c16	2020-11-14 14:18:27.658736+01	2025-09-18 22:55:07.545893+02	3	s1-agent@yopmail.com	\N	12	2025-09-18 22:55:04.854+02	Dragon	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Agent 1	agent	1	{"guide": true, "import": true}	\N	t	2025-09-18 22:55:07.545+02	\N
\.


--
-- Data for Name: user_structure_security; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_structure_security (uuid, "createdAt", "updatedAt", version, "userId", "temporaryTokens", "eventsHistory", "structureId") FROM stdin;
7aef1d02-3021-4988-937c-f18fa6244b14	2021-03-15 16:53:55.740856+01	2021-03-15 16:53:55.740856+01	1	2	\N	[]	1
0068d982-390a-4c42-9b63-55f5c78c6cfd	2021-03-15 16:53:55.740856+01	2021-03-15 16:53:55.740856+01	1	5	\N	[]	3
e931e0d8-ecbb-478a-97a3-a01eac88e24f	2021-03-15 16:53:55.740856+01	2021-03-15 16:53:55.740856+01	1	4	\N	[]	3
3e2118c1-1e0b-4ce7-bc85-22001eebc8ee	2021-03-15 16:53:55.740856+01	2021-03-15 16:53:55.740856+01	1	7	\N	[]	4
8dddd469-7b63-44f3-8166-15830e80ee7b	2021-03-15 16:53:55.740856+01	2021-03-15 16:53:55.740856+01	1	6	\N	[]	1
759bdc26-be9d-4ffb-95c9-8c2d7a06a63b	2021-03-15 16:53:55.740856+01	2021-03-15 16:53:55.740856+01	1	8	\N	[]	3
d84e9cc2-5c52-4a02-880e-bcfb27180594	2021-03-15 16:53:55.74+01	2021-12-06 16:26:00.681872+01	2	10	\N	[{"date": "2021-12-06T15:26:00.672Z", "type": "login-success"}]	3
9fe998b5-7178-44b5-9c40-2e18ba233f1d	2021-03-15 16:53:55.740856+01	2022-03-09 00:20:17.365808+01	3	3	\N	[{"date": "2022-03-08T23:20:17.329Z", "type": "login-success"}]	1
80e97a87-9d11-4487-a3c3-411bbdf42a2c	2022-03-17 17:25:53.809705+01	2022-03-23 22:07:14.867562+01	3	11	\N	[{"date": "2022-03-17T16:33:43.464Z", "type": "login-success"}, {"date": "2022-03-23T21:07:14.852Z", "type": "login-success"}]	5
e0bcefc6-f1be-4c83-ac9d-6ea47335a9c3	2021-03-15 16:53:55.740856+01	2025-03-06 00:34:34.261953+01	10	1	\N	[{"date": "2025-03-05T23:34:34.260Z", "type": "login-error"}]	1
eaa26d58-eb9c-423a-9ce7-d18ac1a9d3ec	2021-03-15 16:53:55.740856+01	2025-09-18 22:55:04.844025+02	2	12	\N	[{"date": "2025-09-18T20:55:04.843Z", "type": "login-success"}]	1
\.


--
-- Data for Name: user_supervisor; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_supervisor (uuid, "createdAt", "updatedAt", version, email, fonction, id, "lastLogin", nom, password, prenom, "passwordLastUpdate", verified, "acceptTerms", territories, role) FROM stdin;
da01f451-9c4f-4f6c-98bb-c635277e33e7	2020-11-17 14:18:47.658+01	2024-10-30 22:34:43.742+01	392	preprod.domifa@fabrique.social.gouv.fr	\N	1	2024-10-30 22:34:43.742+01	Roméro	$2a$10$GQ5/A/bv3NU/lHeaEP35EuOSHQkapPtU1RHy/G1nHuNwujOkovosa	Patrick	\N	t	2023-02-14 18:33:51.261+01	[]	super-admin-domifa
\.


--
-- Data for Name: user_supervisor_security; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_supervisor_security (uuid, "createdAt", "updatedAt", version, "userId", "temporaryTokens", "eventsHistory") FROM stdin;
f1d8975b-e429-41db-9246-bb2b388aece6	2025-04-15 20:14:04.704668+02	2025-04-15 20:14:04.704668+02	1	1	\N	[]
\.


--
-- Data for Name: user_usager; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_usager (uuid, "createdAt", "updatedAt", version, id, "usagerUUID", "structureId", login, password, salt, "lastLogin", "passwordLastUpdate", "lastPasswordResetDate", "lastPasswordResetStructureUser", "acceptTerms", "passwordType") FROM stdin;
a657f4bd-e4d1-4c38-bdd0-ffd268b356df	2021-10-05 11:34:41.369505+02	2023-12-18 17:54:10.81286+01	19	1	b2c26e55-ab37-457d-b307-6fe161050a9b	1	WKYJBDXS	$2a$10$1rKKqmxsaIKyNkyZpm5QHufHZ8JfCSgEtaLOv07oy2QE.O8msCVPO	$2a$10$1rKKqmxsaIKyNkyZpm5QHu	2021-11-30 15:02:07.69+01	\N	2021-10-05 11:34:41.365+02	{"userId": 1, "userName": "Patrick Roméro"}	\N	BIRTH_DATE
a03a9a49-ae31-4160-9879-bab02dc46361	2021-11-30 14:50:26.278073+01	2023-11-20 16:40:58.362384+01	17	2	97b7e840-0e93-4bf4-ba7d-0a406aa898f2	1	LNQIFFBK	$2a$10$/MxpSdJoHG59JaksJx5eSe4U1tHGcVoHEvlDRoi.AsVW2LlybKNnG	$2a$10$zmuPXxUOuQJ7nE6ag4.x6e	2023-11-20 16:40:58.36+01	2021-11-30 15:01:39.675+01	2021-11-30 14:50:26.275+01	{"userId": 1, "userName": "Patrick Roméro"}	\N	PERSONAL
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

COPY public.user_usager_security (uuid, "createdAt", "updatedAt", version, "userId", "structureId", "eventsHistory", "temporaryTokens") FROM stdin;
fadd55b6-ca41-48d4-bd56-238b1a3c6f7b	2021-11-30 14:50:26.290488+01	2023-11-20 16:40:58.2674+01	10	2	1	[{"date": "2023-11-20T15:40:44.378Z", "type": "login-success"}, {"date": "2023-11-20T15:40:58.265Z", "type": "login-success"}]	\N
9bc8decb-5f78-48de-8c1b-9f61ea5acfba	2021-10-05 11:34:41.388922+02	2023-12-18 17:54:10.816927+01	4	1	1	[{"date": "2023-12-18T16:54:10.810Z", "type": "reset-password-success"}]	\N
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

SELECT pg_catalog.setval('public.user_structure_id_seq', 12, true);


--
-- Name: user_supervisor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_supervisor_id_seq', 1, true);


--
-- Name: user_usager_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_usager_id_seq', 2, true);


--
-- PostgreSQL database dump complete
--

