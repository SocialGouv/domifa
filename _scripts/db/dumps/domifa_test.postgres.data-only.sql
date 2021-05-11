--
-- PostgreSQL database dump
--

-- Dumped from database version 10.16 (Debian 10.16-1.pgdg90+1)
-- Dumped by pg_dump version 10.16 (Debian 10.16-1.pgdg90+1)

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
-- Data for Name: structure; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.structure (uuid, "createdAt", "updatedAt", version, id, adresse, "adresseCourrier", agrement, capacite, "codePostal", "complementAdresse", departement, region, email, "hardReset", "tokenDelete", import, "registrationDate", "importDate", "lastLogin", nom, options, phone, responsable, stats, "structureType", token, verified, ville, sms) FROM stdin;
e159011b-6648-426d-a772-b3ca4f27a6d5	2021-01-26 07:51:53.846157+00	2021-01-26 07:51:53.846157+00	1	2	2 rue du test	\N	\N	\N	33600	\N	33	75	cias.test@yopmail.com	\N		f	2020-11-17 13:32:21.959+00	\N	2020-11-17	CIAS de Test	{"numeroBoite": false}	0102030405	{"nom": "Anna", "prenom": "Dupond", "fonction": "PDG"}	{"RADIE": 0, "REFUS": 0, "TOTAL": 0, "VALIDE": 0}	cias	b1ca3193633282c675257f1b05771a7605a4aa1c5ba231b3545564bfa33a	f	Pessac	{"senderName": null, "senderDetails": null, "enabledByDomifa": false, "enabledByStructure": false}
412f6962-fc6e-4e48-b0a6-a37d6eebbc67	2021-01-26 07:51:53.846157+00	2021-02-01 16:13:04.469973+00	14	1	1 rue de l'océan	\N	\N	\N	92600	\N	92	11	ccas.test@yopmail.com	\N		f	2020-11-17 13:30:23.692+00	\N	2021-02-01	CCAS de Test	{"numeroBoite": false}	0602030405	{"nom": "Jean", "prenom": "Thomson", "fonction": "PDG"}	{"RADIE": 0, "REFUS": 0, "TOTAL": 0, "VALIDE": 0}	ccas	adfbfe24ff6de1f4e7c0011ad05028f5a129ced7f120079d20c4adf21d89	t	Asnieres-sur-seine	{"senderName": null, "senderDetails": null, "enabledByDomifa": false, "enabledByStructure": false}
610966c4-ab91-43c0-88da-483ae23d0af2	2021-02-01 16:12:30.65884+00	2021-02-01 16:13:04.633129+00	4	4	rue de l'import	{"actif": false, "ville": "", "adresse": "", "codePostal": ""}	123	\N	44000		44	52	test.import@yopmail.com	\N	\N	f	2021-02-01 16:12:30.655+00	\N	\N	Structure de Test d'import	{"numeroBoite": false}	0101010101	{"nom": "Test", "prenom": "Import", "fonction": "Testeur"}	{"RADIE": 0, "REFUS": 0, "TOTAL": 0, "VALIDE": 0}	asso		t	Nantes	{"senderName": null, "senderDetails": null, "enabledByDomifa": false, "enabledByStructure": false}
1d1ed6f0-7674-474a-908b-d0bd8c6389cb	2021-01-26 07:51:53.846157+00	2021-01-26 07:51:53.846157+00	1	3	1 rue du test de l'organise agréé	\N	1234	80	44000	\N	44	52	organisme.agree@yopmail.com	{"token": "6V0XR2S", "userId": 3}		f	2020-11-17 13:34:35.821+00	\N	\N	Organisme agréé de Test	{"numeroBoite": false}	0506070809	{"nom": "Calvez", "prenom": "Simon", "fonction": "Directeur"}	{"RADIE": 0, "REFUS": 0, "TOTAL": 0, "VALIDE": 0}	asso	b8e2e05b767ac984f0f4b8a222062b07268f46265525f98d83e4b518b343	f	Nantes	{"senderName": null, "senderDetails": null, "enabledByDomifa": false, "enabledByStructure": false}
\.


--
-- Data for Name: app_user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_user (uuid, "createdAt", "updatedAt", version, email, fonction, id, "lastLogin", nom, password, prenom, role, "structureId", mails, "passwordLastUpdate", verified) FROM stdin;
663b9baa-2880-406c-a93a-32fe65528037	2020-11-17 13:18:47.658346+00	2020-11-17 13:18:47.658346+00	1	justeisabelle@yopmail.com	\N	2	\N	Juste	$2a$10$3yXcVfWYOWsI/KzAwZ0BrOay1Dp/ZOF5RjhLL0QA2Pt7gQVg2U86u	Isabelle	simple	1	{"guide": false, "import": false}	\N	t
d81c5566-94f9-4ee4-ab57-a604a654f79b	2020-11-17 13:32:22.193933+00	2020-11-17 13:39:14.015103+00	17	roseline.parmentier@yopmail.com	\N	5	2020-11-17 13:39:13.796+00	Roseline	$2a$10$TXuMkCQubGQGHEFZXmekQOKtoZQmA9Dq9KHZRjB4lLuOa6zBKYODy	Parmentier	admin	3	{"guide": false, "import": false}	2020-11-17 13:39:14.013+00	t
b0140303-79e3-436c-9c41-1eaefeeaed6e	2020-11-17 13:23:20.248011+00	2020-11-17 13:23:20.257747+00	2	peter.smith@yopmail.com	\N	3	\N	Smith	081650dc22d1389c88a23d747b84f8df37d7712985eba94825f97b121413	Peter	responsable	1	{"guide": false, "import": false}	\N	t
d19ece1f-d32b-498c-9427-eb12b1251163	2020-11-17 13:26:29.482634+00	2020-11-17 13:26:29.490297+00	2	facteur.test@yopmail.com	\N	4	\N	Test	271404db7f7456f57e0a9045cdd3096988cd43553c3014642b74c7e86cc6	Facteur	facteur	1	{"guide": false, "import": false}	\N	f
da01f451-9c4f-4f6c-98bb-c635277e33e7	2020-11-17 13:18:47.658346+00	2021-02-01 16:13:04.476361+00	42	ccastest@yopmail.com	\N	1	2021-02-01 16:13:04.475+00	Roméro	$2a$10$3yXcVfWYOWsI/KzAwZ0BrOay1Dp/ZOF5RjhLL0QA2Pt7gQVg2U86u	Patrick	admin	1	{"guide": false, "import": false}	\N	t
44f1cfe8-eae9-49d5-aedb-76dda856c413	2021-02-01 16:12:30.90825+00	2021-02-01 16:13:04.64034+00	2	test.import@yopmail.com	Testeur	7	\N	Test	$2a$10$G24I3QYBxE9SLpb.hbKmmOVppqz9DjcExg0eOZiulyNcGTPCJrnNe	Import	admin	4	{"guide": false, "import": false}	\N	t
\.


--
-- Data for Name: app_user_security; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_user_security (uuid, "createdAt", "updatedAt", version, "userId", "structureId", "temporaryTokens", "eventsHistory") FROM stdin;
7aef1d02-3021-4988-937c-f18fa6244b14	2021-03-15 15:53:55.740856+00	2021-03-15 15:53:55.740856+00	1	2	1	\N	[]
0068d982-390a-4c42-9b63-55f5c78c6cfd	2021-03-15 15:53:55.740856+00	2021-03-15 15:53:55.740856+00	1	5	3	\N	[]
9fe998b5-7178-44b5-9c40-2e18ba233f1d	2021-03-15 15:53:55.740856+00	2021-03-15 15:53:55.740856+00	1	3	1	\N	[]
e931e0d8-ecbb-478a-97a3-a01eac88e24f	2021-03-15 15:53:55.740856+00	2021-03-15 15:53:55.740856+00	1	4	1	\N	[]
e0bcefc6-f1be-4c83-ac9d-6ea47335a9c3	2021-03-15 15:53:55.740856+00	2021-03-15 15:53:55.740856+00	1	1	1	\N	[]
3e2118c1-1e0b-4ce7-bc85-22001eebc8ee	2021-03-15 15:53:55.740856+00	2021-03-15 15:53:55.740856+00	1	7	4	\N	[]
\.


--
-- Data for Name: usager; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usager (uuid, "createdAt", "updatedAt", version, ref, "customRef", "structureId", nom, prenom, surnom, sexe, "dateNaissance", "villeNaissance", langue, email, phone, preference, "datePremiereDom", "typeDom", decision, historique, "ayantsDroits", "lastInteraction", docs, "docsPath", "etapeDemande", rdv, entretien, options) FROM stdin;
4dcdcddc-fad2-4827-aac5-0acf1df7b5bc	2021-01-27 09:21:49.173276+00	2021-03-15 15:53:55.740856+00	2	5	5	1	Derick	Inspecteur	\N	homme	1911-05-24 00:00:00+00	Bergerac	\N	\N	\N	{"email": false, "phone": false}	\N	PREMIERE	{"statut": "ATTENTE_DECISION", "userId": 2, "dateFin": "2021-01-27T09:21:49.242Z", "userName": "Isabelle Juste", "dateDecision": "2019-10-07T19:28:10.777Z", "orientationDetails": null}	[{"motif": "", "statut": "INSTRUCTION", "userId": 1, "dateFin": "2020-10-07T18:52:09.797Z", "typeDom": "PREMIERE", "userName": "Patrick Roméro", "dateDebut": "2019-10-07T18:52:09.797Z", "orientation": "", "dateDecision": "2019-10-07T18:53:06.510Z", "motifDetails": "", "orientationDetails": ""}]	[{"nom": "Inspecteur", "lien": "enfant", "prenom": "Gadget", "dateNaissance": "12/10/1990"}]	{"appel": null, "visite": null, "colisIn": 0, "enAttente": false, "courrierIn": 0, "nbCourrier": 0, "courrierOut": null, "recommandeIn": 0, "recommandeOut": null, "dateInteraction": "2021-01-27T09:21:49.242Z"}	[{"label": "Carte identité", "filetype": "image/jpeg", "createdAt": "2019-10-07T18:53:32.922Z", "createdBy": "Patrick Roméro"}]	["8242ba1bc7f3c3971f761b6a347fc1c4.jpg"]	5	{"userId": 2, "dateRdv": "2019-10-07T19:30:02.675Z", "userName": "Juste Isabelle"}	{"cause": "cause5", "revenus": false, "residence": "HEBERGEMENT_TIERS", "causeDetail": null, "liencommune": null, "commentaires": null, "domiciliation": false, "accompagnement": true, "residenceDetail": null, "accompagnementDetail": "CCAS des mureaux"}	{"npai": {"actif": false}, "transfert": {"nom": null, "actif": false, "adresse": null}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}
ee7ef219-b101-422c-8ad4-4d5aedf9caad	2020-11-01 17:50:10.047+00	2021-03-15 15:53:55.740856+00	2	6	6	1	NOUVEAU	DOSSIER	TEST	homme	1988-11-02 00:00:00+00	Paris	\N	fake-mail@yopmail.com	0101010101	{"email": false, "phone": false}	2020-11-01 00:00:00+00	PREMIERE	{"statut": "VALIDE", "userId": 1, "dateFin": "2021-10-31T00:00:00.000Z", "userName": "Patrick Roméro", "dateDebut": "2020-11-01T00:00:00.000Z", "dateDecision": "2020-11-01T17:50:29.003Z", "orientationDetails": null}	[{"statut": "INSTRUCTION", "userId": 1, "dateFin": "2020-11-01T17:50:10.042Z", "userName": "Patrick Roméro", "dateDecision": "2020-11-01T17:50:10.042Z", "orientationDetails": null}]	[{"nom": "TEST 1 ", "lien": "PARENT", "prenom": "TEST 2 ", "dateNaissance": "20/12/1991"}]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2020-11-01T00:00:00.000Z"}	[]	[]	5	{"userId": 1, "dateRdv": "2020-11-01T17:50:12.019Z", "userName": "Roméro Patrick"}	{"cause": "VIOLENCE", "raison": "EXERCICE_DROITS", "revenus": true, "residence": "HEBERGEMENT_TIERS", "typeMenage": "FEMME_ISOLE_AVEC_ENFANT", "causeDetail": null, "liencommune": null, "orientation": false, "commentaires": null, "raisonDetail": null, "rattachement": null, "domiciliation": true, "revenusDetail": null, "accompagnement": false, "residenceDetail": null, "orientationDetail": null, "accompagnementDetail": null}	{"npai": {"actif": false}, "transfert": {"nom": null, "actif": false, "adresse": null}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}
860ffa4c-88c4-4e1c-ad42-5a05cdf39830	2019-11-22 10:33:43+00	2021-03-15 15:53:55.740856+00	2	1	63	1	Ramirez	Marta	\N	femme	1978-08-07 00:00:00+00	Sao Paulo, Brésil	\N	domicilie1@yopmail.com	0142424241	{"email": false, "phone": false}	2018-03-01 00:00:00+00	PREMIERE	{"motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2019-02-27T00:00:00.000Z", "typeDom": "PREMIERE", "userName": "Patrick Roméro", "dateDebut": "2018-03-01T00:00:00.000Z", "orientation": "", "dateDecision": "2018-03-01T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[]	[{"nom": "Martinez", "lien": "ENFANT", "prenom": "Luiz", "dateNaissance": "20/12/1992"}, {"nom": "Martinez", "lien": "ENFANT", "prenom": "Sylvia", "dateNaissance": "20/10/2007"}]	{"colisIn": 4, "enAttente": true, "courrierIn": 1, "recommandeIn": 3, "dateInteraction": "2020-07-29T11:46:34.680Z"}	[{"label": "CNI", "filetype": "image/jpeg", "createdAt": "2019-10-07T18:51:31.578Z", "createdBy": "Patrick Roméro"}]	["373144a3d9d0b3f4c84bd527a5cff880.jpg"]	5	\N	{"cause": null, "raison": null, "revenus": null, "pourquoi": null, "residence": null, "typeMenage": null, "causeDetail": null, "liencommune": null, "commentaires": null, "raisonDetail": null, "rattachement": null, "domiciliation": null, "revenusDetail": null, "accompagnement": null, "pourquoiDetail": null, "residenceDetail": null, "accompagnementDetail": null}	{"npai": {"actif": false}, "transfert": {"nom": "LHSS Plaisance", "actif": true, "adresse": "12 rue ridder 75014 Paris", "dateFin": "2020-11-07T00:00:00.000Z", "dateDebut": "2020-06-03T12:20:00.603Z"}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}
97b7e840-0e93-4bf4-ba7d-0a406aa898f2	2019-11-22 10:33:43+00	2021-03-15 15:53:55.740856+00	2	2	63	1	Karamoko	Maurice	\N	homme	1998-08-07 00:00:00+00	Bouaké, Côte d'Ivoire	\N	domicilie2@yopmail.com	0142424242	{"email": false, "phone": false}	2018-01-11 00:00:00+00	RENOUVELLEMENT	{"motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2020-02-12T00:00:00.000Z", "typeDom": "RENOUVELLEMENT", "userName": "Patrick Roméro", "dateDebut": "2019-02-12T00:00:00.000Z", "orientation": "", "dateDecision": "2019-02-12T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[]	[{"nom": "Karamoko", "lien": "CONJOINT", "prenom": "Mauricette", "dateNaissance": "20/12/1978"}]	{"colisIn": 0, "enAttente": true, "courrierIn": 2, "recommandeIn": 0, "dateInteraction": "2020-11-01T17:46:54.143Z"}	[]	[]	3	\N	{"cause": "ERRANCE", "raison": "AUTRE", "revenus": false, "residence": "DOMICILE_MOBILE", "typeMenage": "COUPLE_AVEC_ENFANT", "causeDetail": null, "liencommune": null, "orientation": true, "commentaires": null, "raisonDetail": null, "rattachement": null, "domiciliation": true, "revenusDetail": null, "accompagnement": true, "residenceDetail": null, "orientationDetail": null, "accompagnementDetail": null}	{"npai": {"actif": false}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}
e074c416-093a-46fc-ae47-77a3bc111d35	2021-01-27 09:21:49.173276+00	2021-03-15 15:53:55.740856+00	2	3	3	1	Dupont	Fred	fredo	homme	1940-08-07 00:00:00+00	Macon	\N	\N	\N	{"email": false, "phone": false}	2019-10-07 18:50:25.552+00	PREMIERE	{"motif": "SATURATION", "statut": "REFUS", "userId": 1, "dateFin": "2020-08-09T00:00:00.000Z", "typeDom": "PREMIERE", "userName": "Patrick Roméro", "dateDebut": "2019-09-12T00:00:00.000Z", "orientation": "", "dateDecision": "2019-09-12T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[]	[]	{"appel": null, "visite": null, "colisIn": 0, "enAttente": false, "courrierIn": 0, "nbCourrier": 0, "courrierOut": null, "recommandeIn": 0, "recommandeOut": null, "dateInteraction": "2021-01-27T09:21:49.237Z"}	[]	[]	5	\N	{"cause": null, "raison": null, "revenus": null, "pourquoi": null, "residence": null, "typeMenage": null, "causeDetail": null, "liencommune": null, "commentaires": null, "raisonDetail": null, "rattachement": null, "domiciliation": null, "revenusDetail": null, "accompagnement": null, "pourquoiDetail": null, "residenceDetail": null, "accompagnementDetail": null}	{"npai": {"actif": false}, "transfert": {"nom": null, "actif": false, "adresse": null}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}
427e6af6-706b-40d4-9506-de21190e6f0d	2021-01-27 09:21:49.173276+00	2021-03-15 15:53:55.740856+00	2	4	4	1	Loumiel	Lisa	Lilou	femme	1990-04-18 00:00:00+00	Marseille	\N	\N	0142494242	{"email": false, "phone": false}	2019-08-09 00:00:00+00	PREMIERE	{"motif": "NON_RESPECT_REGLEMENT", "statut": "RADIE", "userId": 1, "dateFin": "2019-09-12T00:00:00.000Z", "typeDom": "PREMIERE", "userName": "Patrick Roméro", "dateDebut": "2019-08-09T00:00:00.000Z", "orientation": "", "dateDecision": "2019-09-12T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[]	[]	{"appel": null, "visite": null, "colisIn": 0, "enAttente": false, "courrierIn": 0, "nbCourrier": 0, "courrierOut": null, "recommandeIn": 0, "recommandeOut": null, "dateInteraction": "2021-01-27T09:21:49.240Z"}	[]	[]	5	\N	{"cause": null, "raison": null, "revenus": null, "pourquoi": null, "residence": null, "typeMenage": null, "causeDetail": null, "liencommune": null, "commentaires": null, "raisonDetail": null, "rattachement": null, "domiciliation": null, "revenusDetail": null, "accompagnement": null, "pourquoiDetail": null, "residenceDetail": null, "accompagnementDetail": null}	{"npai": {"actif": false}, "transfert": {"nom": null, "actif": false, "adresse": null}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}
\.


--
-- Data for Name: interactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.interactions (uuid, "createdAt", "updatedAt", version, id, "dateInteraction", "nbCourrier", "structureId", type, "usagerRef", "userId", "userName", content, "usagerUUID") FROM stdin;
4fc32424-3f6e-48c7-9ef1-02b9db388445	2020-11-18 11:01:52.072912+00	2020-11-18 11:01:52.072912+00	1	5	2020-11-01 18:47:00.286	3	1	recommandeIn	1	1	Patrick Roméro		860ffa4c-88c4-4e1c-ad42-5a05cdf39830
44ba43d0-ab44-4449-a6e1-40cbcbc92adc	2020-11-18 11:01:52.072912+00	2020-11-18 11:01:52.072912+00	1	6	2020-11-01 18:47:03.303	4	1	colisIn	1	1	Patrick Roméro		860ffa4c-88c4-4e1c-ad42-5a05cdf39830
b174770d-dfb4-45ea-bf5c-58f1288ff6dd	2020-11-18 11:01:52.072912+00	2020-11-18 11:01:52.072912+00	1	7	2020-11-01 18:47:06.168	1	1	courrierIn	1	1	Patrick Roméro		860ffa4c-88c4-4e1c-ad42-5a05cdf39830
086a249e-67ea-462c-bb84-4aac5bf0b854	2020-11-18 11:01:52.072912+00	2020-11-18 11:01:52.072912+00	1	1	2020-11-01 18:41:28.157	1	1	courrierIn	2	1	Patrick Roméro		97b7e840-0e93-4bf4-ba7d-0a406aa898f2
f5200bf7-4ec7-4331-b931-fe36df84014a	2020-11-18 11:01:52.072912+00	2020-11-18 11:01:52.072912+00	1	2	2020-11-01 18:46:51.913	1	1	courrierIn	2	1	Patrick Roméro		97b7e840-0e93-4bf4-ba7d-0a406aa898f2
656aa50a-0a2c-4fe3-a312-8b694aa5f9ec	2020-11-18 11:01:52.072912+00	2020-11-18 11:01:52.072912+00	1	3	2020-11-01 18:46:53.24	1	1	courrierIn	2	1	Patrick Roméro		97b7e840-0e93-4bf4-ba7d-0a406aa898f2
05706b0a-4434-4e90-8288-b58f2fe17c33	2020-11-18 11:01:52.072912+00	2020-11-18 11:01:52.072912+00	1	4	2020-11-01 18:46:54.143	0	1	visite	2	1	Patrick Roméro		97b7e840-0e93-4bf4-ba7d-0a406aa898f2
\.


--
-- Data for Name: message_email; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_email (uuid, "createdAt", "updatedAt", version, status, "emailId", "initialScheduledDate", "nextScheduledDate", "sendDate", content, "errorCount", "errorMessage", "sendDetails", attachments) FROM stdin;
1a8fc8f6-bc6b-40fb-b2ed-b4e1af5cb4b5	2021-01-26 09:04:24.386282+00	2021-01-26 09:04:24.386282+00	1	pending	user-reset-password	2021-01-26 09:04:24.381+00	2021-01-26 09:04:24.381+00	\N	{"to": [{"address": "ccastest@yopmail.com", "personalName": "Roméro Patrick"}], "from": {"personalName": "Domifa"}, "replyTo": {"personalName": "Domifa"}, "subject": "Demande d'un nouveau mot de passe", "tipimailModels": [{"email": "ccastest@yopmail.com", "values": {"lien": "http://localhost:4200/reset-password/3d6a46c1ce375273a5db76838c6b5c73feb0bf97f88fa40698b67c2a97eb", "prenom": "Patrick"}, "subject": "Demande d'un nouveau mot de passe"}], "tipimailTemplateId": "users-nouveau-mot-de-passe"}	0	\N	\N	\N
3192eafb-b86d-4f2f-ad6c-f7f7df01508a	2021-02-01 16:12:30.914556+00	2021-02-01 16:12:30.914556+00	1	pending	structure-created	2021-02-01 16:12:30.914+00	2021-02-01 16:12:30.914+00	\N	{"to": [{"personalName": "Domifa"}], "from": {"personalName": "Domifa"}, "replyTo": {"personalName": "Domifa"}, "subject": "Nouvelle structure sur Domifa ", "tipimailModels": [{"meta": {}, "values": {"email": "test.import@yopmail.com", "phone": "0101010101", "ville": "Nantes", "adresse": "rue de l'import", "user_nom": "Test", "user_email": "test.import@yopmail.com", "code_postal": "44000", "departement": "Loire-Atlantique", "user_prenom": "Import", "structure_name": "Structure de Test d'import", "structure_type": "Organisme agrée", "responsable_nom": "Test", "lien_suppression": "http://localhost:4200/structures/delete/4/63ba3e786570cfc32fdc9d2d46b365cb23d4b955df308579ffd0ab0f23c7", "lien_confirmation": "http://localhost:4200/structures/confirm/4/63ba3e786570cfc32fdc9d2d46b365cb23d4b955df308579ffd0ab0f23c7", "responsable_prenom": "Import", "responsable_fonction": "Testeur"}, "subject": "Nouvelle structure sur Domifa "}], "tipimailTemplateId": "domifa-nouvelle-structure"}	0	\N	\N	\N
3e6f55be-2f38-4dad-8bcf-16551f9154e7	2021-02-01 16:13:04.645677+00	2021-02-01 16:13:04.645677+00	1	pending	user-account-activated	2021-02-01 16:13:04.644+00	2021-02-01 16:13:04.644+00	\N	{"to": [{"address": "test.import@yopmail.com", "personalName": "Import Test"}], "from": {"personalName": "Domifa"}, "replyTo": {"personalName": "Domifa"}, "subject": "Votre compte Domifa a été activé", "tipimailModels": [{"meta": {}, "email": "test.import@yopmail.com", "values": {"lien": "http://localhost:4200/", "prenom": "Import", "nom_structure": "Structure de Test d'import"}, "subject": "Votre compte Domifa a été activé"}], "tipimailTemplateId": "users-compte-active"}	0	\N	\N	\N
\.


--
-- Data for Name: message_sms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_sms (uuid, "createdAt", "updatedAt", version, "usagerRef", "structureId", content, status, "smsId", "scheduledDate", "sendDate", "interactionMetas", "reminderMetas", "statusUpdates", "lastUpdate", "errorCount", "errorMessage", "responseId", "phoneNumber", "senderName") FROM stdin;
\.


--
-- Data for Name: monitor_batch_process; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.monitor_batch_process (uuid, "createdAt", "updatedAt", version, "processId", "beginDate", "endDate", trigger, status, details, "errorMessage", "alertMailSent") FROM stdin;
\.


--
-- Data for Name: structure_doc; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.structure_doc (uuid, "createdAt", "updatedAt", version, id, label, "createdBy", tags, custom, filetype, "structureId", path) FROM stdin;
\.


--
-- Data for Name: structure_stats; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.structure_stats (uuid, "createdAt", "updatedAt", version, nom, date, "structureId", "structureType", departement, ville, capacite, "codePostal", questions, generated) FROM stdin;
ed17c20a-b3ba-4acb-882c-e8db831ae41c	2020-12-07 13:27:17.589338+00	2021-04-06 21:49:15.907609+00	2	CCAS de test	2020-10-30	1	ccas	92	Asnieres-sur-seine	\N	92600	{"Q_10": 0, "Q_11": {"RADIE": 0, "REFUS": 0, "VALIDE": 0, "VALIDE_TOTAL": 0, "VALIDE_AYANTS_DROIT": 0}, "Q_12": {"AUTRE": 0, "TOTAL": 0, "A_SA_DEMANDE": 0, "ENTREE_LOGEMENT": 0, "FIN_DE_DOMICILIATION": 0, "PLUS_DE_LIEN_COMMUNE": 0, "NON_RESPECT_REGLEMENT": 0, "NON_MANIFESTATION_3_MOIS": 0}, "Q_13": {"AUTRE": 0, "TOTAL": 0, "SATURATION": 0, "LIEN_COMMUNE": 0, "HORS_AGREMENT": 0}, "Q_14": {"ASSO": 0, "CCAS": 0}, "Q_17": 0, "Q_18": 0, "Q_19": {"COUPLE_AVEC_ENFANT": 0, "COUPLE_SANS_ENFANT": 0, "FEMME_ISOLE_AVEC_ENFANT": 0, "FEMME_ISOLE_SANS_ENFANT": 0, "HOMME_ISOLE_AVEC_ENFANT": 0, "HOMME_ISOLE_SANS_ENFANT": 0}, "Q_20": {"npai": 0, "appel": 0, "visite": 0, "colisIn": 0, "colisOut": 0, "courrierIn": 0, "courrierOut": 0, "recommandeIn": 0, "recommandeOut": 0}, "Q_21": {"AUTRE": 0, "ERRANCE": 0, "RUPTURE": 0, "VIOLENCE": 0, "EXPULSION": 0, "ITINERANT": 0, "NON_RENSEIGNE": 0, "RAISON_DEMANDE": {"AUTRE": 1, "EXERCICE_DROITS": 0, "PRESTATIONS_SOCIALES": 0}, "SORTIE_STRUCTURE": 0, "HEBERGE_SANS_ADRESSE": 0}, "Q_22": {"AUTRE": 0, "HOTEL": 0, "SANS_ABRI": 0, "NON_RENSEIGNE": 0, "DOMICILE_MOBILE": 0, "HEBERGEMENT_TIERS": 0, "HEBERGEMENT_SOCIAL": 0}, "Q_10_A": 0, "Q_10_B": 0, "USAGERS": {"SEXE": {"F": 1, "H": 1}, "TRANCHE_AGE": {"T_0_14": 0, "T_15_19": 0, "T_20_24": 1, "T_25_29": 0, "T_30_34": 0, "T_35_39": 0, "T_40_44": 1, "T_45_49": 0, "T_50_54": 0, "T_55_59": 0, "T_60_64": 0, "T_65_69": 0, "T_70_74": 0, "T_75_PLUS": 0}}}	f
57a0f2d6-6f38-40c6-97dd-f3ab1baafd50	2020-12-07 13:27:17.589338+00	2021-04-06 21:49:15.922936+00	2	CIAS de Test	2020-11-16	2	cias	33	Pessac	\N	33600	{"Q_10": 0, "Q_11": {"RADIE": 0, "REFUS": 0, "VALIDE": 0, "VALIDE_TOTAL": 0, "VALIDE_AYANTS_DROIT": 0}, "Q_12": {"AUTRE": 0, "TOTAL": 0, "A_SA_DEMANDE": 0, "ENTREE_LOGEMENT": 0, "FIN_DE_DOMICILIATION": 0, "PLUS_DE_LIEN_COMMUNE": 0, "NON_RESPECT_REGLEMENT": 0, "NON_MANIFESTATION_3_MOIS": 0}, "Q_13": {"AUTRE": 0, "TOTAL": 0, "SATURATION": 0, "LIEN_COMMUNE": 0, "HORS_AGREMENT": 0}, "Q_14": {"ASSO": 0, "CCAS": 0}, "Q_17": 0, "Q_18": 0, "Q_19": {"COUPLE_AVEC_ENFANT": 0, "COUPLE_SANS_ENFANT": 0, "FEMME_ISOLE_AVEC_ENFANT": 0, "FEMME_ISOLE_SANS_ENFANT": 0, "HOMME_ISOLE_AVEC_ENFANT": 0, "HOMME_ISOLE_SANS_ENFANT": 0}, "Q_20": {"npai": 0, "appel": 0, "visite": 0, "colisIn": 0, "colisOut": 0, "courrierIn": 0, "courrierOut": 0, "recommandeIn": 0, "recommandeOut": 0}, "Q_21": {"AUTRE": 0, "ERRANCE": 0, "RUPTURE": 0, "VIOLENCE": 0, "EXPULSION": 0, "ITINERANT": 0, "NON_RENSEIGNE": 0, "RAISON_DEMANDE": {"AUTRE": 0, "EXERCICE_DROITS": 0, "PRESTATIONS_SOCIALES": 0}, "SORTIE_STRUCTURE": 0, "HEBERGE_SANS_ADRESSE": 0}, "Q_22": {"AUTRE": 0, "HOTEL": 0, "SANS_ABRI": 0, "NON_RENSEIGNE": 0, "DOMICILE_MOBILE": 0, "HEBERGEMENT_TIERS": 0, "HEBERGEMENT_SOCIAL": 0}, "Q_10_A": 0, "Q_10_B": 0, "USAGERS": {"SEXE": {"F": 0, "H": 0}, "TRANCHE_AGE": {"T_0_14": 0, "T_15_19": 0, "T_20_24": 0, "T_25_29": 0, "T_30_34": 0, "T_35_39": 0, "T_40_44": 0, "T_45_49": 0, "T_50_54": 0, "T_55_59": 0, "T_60_64": 0, "T_65_69": 0, "T_70_74": 0, "T_75_PLUS": 0}}}	f
72932055-e1ed-4b8c-af36-a6ece9d12b9c	2020-12-07 13:27:17.589338+00	2021-04-06 21:49:15.937617+00	2	CIAS de Test	2020-11-16	3	cias	33	Pessac	\N	33600	{"Q_10": 0, "Q_11": {"RADIE": 0, "REFUS": 0, "VALIDE": 0, "VALIDE_TOTAL": 0, "VALIDE_AYANTS_DROIT": 0}, "Q_12": {"AUTRE": 0, "TOTAL": 0, "A_SA_DEMANDE": 0, "ENTREE_LOGEMENT": 0, "FIN_DE_DOMICILIATION": 0, "PLUS_DE_LIEN_COMMUNE": 0, "NON_RESPECT_REGLEMENT": 0, "NON_MANIFESTATION_3_MOIS": 0}, "Q_13": {"AUTRE": 0, "TOTAL": 0, "SATURATION": 0, "LIEN_COMMUNE": 0, "HORS_AGREMENT": 0}, "Q_14": {"ASSO": 0, "CCAS": 0}, "Q_17": 0, "Q_18": 0, "Q_19": {"COUPLE_AVEC_ENFANT": 0, "COUPLE_SANS_ENFANT": 0, "FEMME_ISOLE_AVEC_ENFANT": 0, "FEMME_ISOLE_SANS_ENFANT": 0, "HOMME_ISOLE_AVEC_ENFANT": 0, "HOMME_ISOLE_SANS_ENFANT": 0}, "Q_20": {"npai": 0, "appel": 0, "visite": 0, "colisIn": 0, "colisOut": 0, "courrierIn": 0, "courrierOut": 0, "recommandeIn": 0, "recommandeOut": 0}, "Q_21": {"AUTRE": 0, "ERRANCE": 0, "RUPTURE": 0, "VIOLENCE": 0, "EXPULSION": 0, "ITINERANT": 0, "NON_RENSEIGNE": 0, "RAISON_DEMANDE": {"AUTRE": 0, "EXERCICE_DROITS": 0, "PRESTATIONS_SOCIALES": 0}, "SORTIE_STRUCTURE": 0, "HEBERGE_SANS_ADRESSE": 0}, "Q_22": {"AUTRE": 0, "HOTEL": 0, "SANS_ABRI": 0, "NON_RENSEIGNE": 0, "DOMICILE_MOBILE": 0, "HEBERGEMENT_TIERS": 0, "HEBERGEMENT_SOCIAL": 0}, "Q_10_A": 0, "Q_10_B": 0, "USAGERS": {"SEXE": {"F": 0, "H": 0}, "TRANCHE_AGE": {"T_0_14": 0, "T_15_19": 0, "T_20_24": 0, "T_25_29": 0, "T_30_34": 0, "T_35_39": 0, "T_40_44": 0, "T_45_49": 0, "T_50_54": 0, "T_55_59": 0, "T_60_64": 0, "T_65_69": 0, "T_70_74": 0, "T_75_PLUS": 0}}}	f
4486ff04-ca4a-43e2-beb3-a594bcacdecf	2020-11-01 17:54:00.01+00	2021-04-06 21:49:15.88766+00	2	CCAS de test	2020-10-31	1	ccas	92	Asnieres-sur-seine	\N	92600	{"Q_10": 1, "Q_11": {"RADIE": 1, "REFUS": 1, "VALIDE": 3, "VALIDE_TOTAL": 7, "VALIDE_AYANTS_DROIT": 4}, "Q_12": {"AUTRE": 0, "TOTAL": 0, "A_SA_DEMANDE": 0, "ENTREE_LOGEMENT": 0, "FIN_DE_DOMICILIATION": 0, "PLUS_DE_LIEN_COMMUNE": 0, "NON_RESPECT_REGLEMENT": 0, "NON_MANIFESTATION_3_MOIS": 0}, "Q_13": {"AUTRE": 0, "TOTAL": 0, "SATURATION": 0, "LIEN_COMMUNE": 0, "HORS_AGREMENT": 0}, "Q_14": {"ASSO": 0, "CCAS": 0}, "Q_17": 0, "Q_18": 3, "Q_19": {"COUPLE_AVEC_ENFANT": 1, "COUPLE_SANS_ENFANT": 0, "FEMME_ISOLE_AVEC_ENFANT": 1, "FEMME_ISOLE_SANS_ENFANT": 0, "HOMME_ISOLE_AVEC_ENFANT": 0, "HOMME_ISOLE_SANS_ENFANT": 0}, "Q_20": {"npai": 0, "appel": 0, "visite": 1, "colisIn": 4, "colisOut": 0, "courrierIn": 4, "courrierOut": 0, "recommandeIn": 3, "recommandeOut": 0}, "Q_21": {"AUTRE": 0, "ERRANCE": 1, "RUPTURE": 0, "VIOLENCE": 1, "EXPULSION": 0, "ITINERANT": 0, "NON_RENSEIGNE": 1, "RAISON_DEMANDE": {"AUTRE": 1, "EXERCICE_DROITS": 0, "PRESTATIONS_SOCIALES": 0}, "SORTIE_STRUCTURE": 0, "HEBERGE_SANS_ADRESSE": 0}, "Q_22": {"AUTRE": 0, "HOTEL": 0, "SANS_ABRI": 0, "NON_RENSEIGNE": 1, "DOMICILE_MOBILE": 1, "HEBERGEMENT_TIERS": 1, "HEBERGEMENT_SOCIAL": 0}, "Q_10_A": 1, "Q_10_B": 0, "USAGERS": {"SEXE": {"F": 1, "H": 1}, "TRANCHE_AGE": {"T_0_14": 0, "T_15_19": 0, "T_20_24": 1, "T_25_29": 0, "T_30_34": 0, "T_35_39": 0, "T_40_44": 1, "T_45_49": 0, "T_50_54": 0, "T_55_59": 0, "T_60_64": 0, "T_65_69": 0, "T_70_74": 0, "T_75_PLUS": 0}}}	f
\.


--
-- Name: app_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.app_user_id_seq', 7, true);


--
-- Name: interactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.interactions_id_seq', 7, true);


--
-- Name: structure_doc_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.structure_doc_id_seq', 1, false);


--
-- Name: structure_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.structure_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--

