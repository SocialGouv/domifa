--
-- PostgreSQL database dump
--

-- Dumped from database version 10.18 (Debian 10.18-1.pgdg90+1)
-- Dumped by pg_dump version 10.18 (Debian 10.18-1.pgdg90+1)

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

COPY public.structure (uuid, "createdAt", "updatedAt", version, id, adresse, "adresseCourrier", agrement, capacite, "codePostal", "complementAdresse", departement, region, email, "hardReset", "tokenDelete", import, "registrationDate", "importDate", "lastLogin", nom, options, phone, responsable, "structureType", token, verified, ville, sms, "portailUsager") FROM stdin;
e159011b-6648-426d-a772-b3ca4f27a6d5	2021-01-26 07:51:53.846157+00	2021-01-26 07:51:53.846157+00	1	2	2 rue du test	\N	\N	\N	33600	\N	33	75	cias.test@yopmail.com	\N		f	2020-11-17 13:32:21.959+00	\N	2020-11-17	CIAS de Test	{"numeroBoite": false}	0102030405	{"nom": "Anna", "prenom": "Dupond", "fonction": "PDG"}	cias	b1ca3193633282c675257f1b05771a7605a4aa1c5ba231b3545564bfa33a	f	Pessac	{"senderName": null, "senderDetails": null, "enabledByDomifa": false, "enabledByStructure": false}	{"enabledByDomifa": false, "enabledByStructure": false}
1d1ed6f0-7674-474a-908b-d0bd8c6389cb	2021-01-26 07:51:53.846157+00	2021-01-26 07:51:53.846157+00	1	3	"1 rue du test de l\'organise agréé"	\N	1234	80	44000	\N	44	52	organisme.agree@yopmail.com	{"token": "6V0XR2S", "userId": 3}		f	2020-11-17 13:34:35.821+00	\N	\N	Organisme agréé de Test	{"numeroBoite": false}	0506070809	{"nom": "Calvez", "prenom": "Simon", "fonction": "Directeur"}	asso	b8e2e05b767ac984f0f4b8a222062b07268f46265525f98d83e4b518b343	f	Nantes	{"senderName": null, "senderDetails": null, "enabledByDomifa": false, "enabledByStructure": false}	{"enabledByDomifa": false, "enabledByStructure": false}
610966c4-ab91-43c0-88da-483ae23d0af2	2021-02-01 16:12:30.65884+00	2021-10-05 09:24:59.084266+00	6	"4	rue de l\'import"	{"actif": false, "ville": "", "adresse": "", "codePostal": ""}	123	\N	44000		44	52	test.import@yopmail.com	\N	\N	f	2021-02-01 16:12:30.655+00	\N	\N	"Structure de Test d\'import"	{"numeroBoite": false}	0101010101	{"nom": "Test", "prenom": "Import", "fonction": "Testeur"}	asso		t	Nantes	{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false}	{"enabledByDomifa": true, "enabledByStructure": false}
412f6962-fc6e-4e48-b0a6-a37d6eebbc67	2021-01-26 07:51:53.846157+00	2021-10-05 09:47:58.089939+00	204	1	"1 rue de l\'océan"	\N	\N	\N	92600	\N	92	11	ccas.test@yopmail.com	\N		f	2020-11-17 13:30:23.692+00	\N	2021-10-05	CCAS de Test	{"numeroBoite": false}	0602030405	{"nom": "Jean", "prenom": "Thomson", "fonction": "PDG"}	ccas	adfbfe24ff6de1f4e7c0011ad05028f5a129ced7f120079d20c4adf21d89	t	Asnieres-sur-seine	{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false}	{"enabledByDomifa": true, "enabledByStructure": true}
\.


--
-- Data for Name: usager; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usager (uuid, "createdAt", "updatedAt", version, ref, "customRef", "structureId", nom, prenom, surnom, sexe, "dateNaissance", "villeNaissance", langue, email, phone, preference, "datePremiereDom", "typeDom", decision, historique, "ayantsDroits", "lastInteraction", docs, "docsPath", "etapeDemande", rdv, entretien, options, import, notes) FROM stdin;
97b7e840-0e93-4bf4-ba7d-0a406aa898f2	2019-11-22 10:33:43+00	2021-06-15 09:19:07.821605+00	4	2	63	1	Karamoko	Maurice	\N	homme	1998-08-07 00:00:00+00	Bouaké, "Côte d\'Ivoire"	\N	domicilie2@yopmail.com	0142424242	{"email": false, "phone": false}	2018-01-11 00:00:00+00	RENOUVELLEMENT	{"uuid": "178ad317-0bd1-41e7-ad87-fd371f166310", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2020-02-12T00:00:00.000Z", "typeDom": "RENOUVELLEMENT", "userName": "Patrick Roméro", "dateDebut": "2019-02-12T00:00:00.000Z", "orientation": "", "dateDecision": "2019-02-12T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[{"uuid": "178ad317-0bd1-41e7-ad87-fd371f166310", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2020-02-12T00:00:00.000Z", "typeDom": "RENOUVELLEMENT", "userName": "Patrick Roméro", "dateDebut": "2019-02-12T00:00:00.000Z", "orientation": "", "dateDecision": "2019-02-12T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}]	[{"nom": "Karamoko", "lien": "CONJOINT", "prenom": "Mauricette", "dateNaissance": "1978-12-20T00:00:00.000Z"}]	{"colisIn": 0, "enAttente": true, "courrierIn": 2, "recommandeIn": 0, "dateInteraction": "2020-11-01T17:46:54.143Z"}	[]	[]	3	\N	{"cause": "ERRANCE", "raison": "AUTRE", "revenus": false, "residence": "DOMICILE_MOBILE", "typeMenage": "COUPLE_AVEC_ENFANT", "causeDetail": null, "liencommune": null, "orientation": true, "commentaires": null, "raisonDetail": null, "rattachement": null, "domiciliation": true, "revenusDetail": null, "accompagnement": true, "residenceDetail": null, "orientationDetail": null, "accompagnementDetail": null}	{"npai": {"actif": false}, "transfert": {"nom": null, "actif": false, "adresse": null, "dateFin": null, "dateDebut": null}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}	\N	[]
e074c416-093a-46fc-ae47-77a3bc111d35	2021-01-27 09:21:49.173276+00	2021-06-15 09:19:07.821605+00	3	3	3	1	Dupont	Fred	fredo	homme	1940-08-07 00:00:00+00	Macon	\N	\N	\N	{"email": false, "phone": false}	2019-10-07 18:50:25.552+00	PREMIERE_DOM	{"uuid": "30ababd0-8e2f-4917-9662-9c812d604dda", "motif": "SATURATION", "statut": "REFUS", "userId": 1, "dateFin": "2020-08-09T00:00:00.000Z", "typeDom": "PREMIERE", "userName": "Patrick Roméro", "dateDebut": "2019-09-12T00:00:00.000Z", "orientation": "", "dateDecision": "2019-09-12T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[{"uuid": "30ababd0-8e2f-4917-9662-9c812d604dda", "motif": "SATURATION", "statut": "REFUS", "userId": 1, "dateFin": "2020-08-09T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2019-09-12T00:00:00.000Z", "orientation": "", "dateDecision": "2019-09-12T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}]	[]	{"appel": null, "visite": null, "colisIn": 0, "enAttente": false, "courrierIn": 0, "nbCourrier": 0, "courrierOut": null, "recommandeIn": 0, "recommandeOut": null, "dateInteraction": "2021-01-27T09:21:49.237Z"}	[]	[]	5	\N	{"cause": null, "raison": null, "revenus": null, "pourquoi": null, "residence": null, "typeMenage": null, "causeDetail": null, "liencommune": null, "commentaires": null, "raisonDetail": null, "rattachement": null, "domiciliation": null, "revenusDetail": null, "accompagnement": null, "pourquoiDetail": null, "residenceDetail": null, "accompagnementDetail": null}	{"npai": {"actif": false}, "transfert": {"nom": null, "actif": false, "adresse": null}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}	\N	[]
ee7ef219-b101-422c-8ad4-4d5aedf9caad	2020-11-01 17:50:10.047+00	2021-06-15 09:19:07.821605+00	4	6	6	1	NOUVEAU	DOSSIER	TEST	homme	1988-11-02 00:00:00+00	Paris	\N	fake-mail@yopmail.com	0101010101	{"email": false, "phone": false}	2020-11-01 00:00:00+00	PREMIERE_DOM	{"uuid": "bf35d476-35d6-4d3d-93b4-dfd49816904f", "statut": "VALIDE", "userId": 1, "dateFin": "2021-10-31T00:00:00.000Z", "userName": "Patrick Roméro", "dateDebut": "2020-11-01T00:00:00.000Z", "dateDecision": "2020-11-01T17:50:29.003Z", "orientationDetails": null}	[{"uuid": "8bd1eae7-7635-4c75-ba64-ad78b1141baf", "statut": "INSTRUCTION", "userId": 1, "dateFin": "2020-11-01T17:50:10.042Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2020-11-01T17:50:10.042Z", "dateDecision": "2020-11-01T17:50:10.042Z", "orientationDetails": null}, {"uuid": "bf35d476-35d6-4d3d-93b4-dfd49816904f", "statut": "VALIDE", "userId": 1, "dateFin": "2021-10-31T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2020-11-01T00:00:00.000Z", "dateDecision": "2020-11-01T17:50:29.003Z", "orientationDetails": null}]	[{"nom": "TEST 1 ", "lien": "PARENT", "prenom": "TEST 2 ", "dateNaissance": "1991-12-20T00:00:00.000Z"}]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2020-11-01T00:00:00.000Z"}	[]	[]	5	{"userId": 1, "dateRdv": "2020-11-01T17:50:12.019Z", "userName": "Roméro Patrick"}	{"cause": "VIOLENCE", "raison": "EXERCICE_DROITS", "revenus": true, "residence": "HEBERGEMENT_TIERS", "typeMenage": "FEMME_ISOLE_AVEC_ENFANT", "causeDetail": null, "liencommune": null, "orientation": false, "commentaires": null, "raisonDetail": null, "rattachement": null, "domiciliation": true, "revenusDetail": null, "accompagnement": false, "residenceDetail": null, "orientationDetail": null, "accompagnementDetail": null}	{"npai": {"actif": false}, "transfert": {"nom": null, "actif": false, "adresse": null}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}	\N	[]
860ffa4c-88c4-4e1c-ad42-5a05cdf39830	2019-11-22 10:33:43+00	2021-06-15 09:19:07.821605+00	4	1	63	1	Ramirez	Marta	\N	femme	1978-08-07 00:00:00+00	Sao Paulo, Brésil	\N	domicilie1@yopmail.com	0142424241	{"email": false, "phone": false}	2018-03-01 00:00:00+00	PREMIERE_DOM	{"uuid": "52ba789e-eb21-4d84-9176-abe1e0d3c778", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2019-02-27T00:00:00.000Z", "typeDom": "PREMIERE", "userName": "Patrick Roméro", "dateDebut": "2018-03-01T00:00:00.000Z", "orientation": "", "dateDecision": "2018-03-01T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[{"uuid": "52ba789e-eb21-4d84-9176-abe1e0d3c778", "motif": null, "statut": "VALIDE", "userId": 1, "dateFin": "2019-02-27T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2018-03-01T00:00:00.000Z", "orientation": "", "dateDecision": "2018-03-01T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}]	[{"nom": "Martinez", "lien": "ENFANT", "prenom": "Luiz", "dateNaissance": "1992-12-20T00:00:00.000Z"}, {"nom": "Martinez", "lien": "ENFANT", "prenom": "Sylvia", "dateNaissance": "2007-10-20T00:00:00.000Z"}]	{"colisIn": 4, "enAttente": true, "courrierIn": 1, "recommandeIn": 3, "dateInteraction": "2020-07-29T11:46:34.680Z"}	[{"label": "CNI", "filetype": "image/jpeg", "createdAt": "2019-10-07T18:51:31.578Z", "createdBy": "Patrick Roméro"}]	["373144a3d9d0b3f4c84bd527a5cff880.jpg"]	5	\N	{"cause": null, "raison": null, "revenus": null, "pourquoi": null, "residence": null, "typeMenage": null, "causeDetail": null, "liencommune": null, "commentaires": null, "raisonDetail": null, "rattachement": null, "domiciliation": null, "revenusDetail": null, "accompagnement": null, "pourquoiDetail": null, "residenceDetail": null, "accompagnementDetail": null}	{"npai": {"actif": false}, "transfert": {"nom": "LHSS Plaisance", "actif": true, "adresse": "12 rue ridder 75014 Paris", "dateFin": "2020-11-07T00:00:00.000Z", "dateDebut": "2020-06-03T12:20:00.603Z"}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}	\N	[]
427e6af6-706b-40d4-9506-de21190e6f0d	2021-01-27 09:21:49.173276+00	2021-06-15 09:19:07.821605+00	3	4	4	1	Loumiel	Lisa	Lilou	femme	1990-04-18 00:00:00+00	Marseille	\N	\N	0142494242	{"email": false, "phone": false}	2019-08-09 00:00:00+00	PREMIERE_DOM	{"uuid": "0c3f2589-d5d3-4138-a4bc-2a594678461e", "motif": "NON_RESPECT_REGLEMENT", "statut": "RADIE", "userId": 1, "dateFin": "2019-09-12T00:00:00.000Z", "typeDom": "PREMIERE", "userName": "Patrick Roméro", "dateDebut": "2019-08-09T00:00:00.000Z", "orientation": "", "dateDecision": "2019-09-12T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}	[{"uuid": "0c3f2589-d5d3-4138-a4bc-2a594678461e", "motif": "NON_RESPECT_REGLEMENT", "statut": "RADIE", "userId": 1, "dateFin": "2019-09-12T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2019-08-09T00:00:00.000Z", "orientation": "", "dateDecision": "2019-09-12T00:00:00.000Z", "motifDetails": "", "orientationDetails": ""}]	[]	{"appel": null, "visite": null, "colisIn": 0, "enAttente": false, "courrierIn": 0, "nbCourrier": 0, "courrierOut": null, "recommandeIn": 0, "recommandeOut": null, "dateInteraction": "2021-01-27T09:21:49.240Z"}	[]	[]	5	\N	{"cause": null, "raison": null, "revenus": null, "pourquoi": null, "residence": null, "typeMenage": null, "causeDetail": null, "liencommune": null, "commentaires": null, "raisonDetail": null, "rattachement": null, "domiciliation": null, "revenusDetail": null, "accompagnement": null, "pourquoiDetail": null, "residenceDetail": null, "accompagnementDetail": null}	{"npai": {"actif": false}, "transfert": {"nom": null, "actif": false, "adresse": null}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}	\N	[]
4dcdcddc-fad2-4827-aac5-0acf1df7b5bc	2021-01-27 09:21:49.173276+00	2021-06-15 09:19:07.821605+00	4	5	5	1	Derick	Inspecteur	\N	homme	1911-05-24 00:00:00+00	Bergerac	\N	\N	\N	{"email": false, "phone": false}	\N	PREMIERE_DOM	{"uuid": "c6aabd3b-7485-4efd-8c09-5080b91709d9", "statut": "ATTENTE_DECISION", "userId": 2, "dateFin": "2021-01-27T09:21:49.242Z", "userName": "Isabelle Juste", "dateDecision": "2019-10-07T19:28:10.777Z", "orientationDetails": null}	[{"uuid": "6f18c8d5-27b7-45c5-882d-e23876a3b1ed", "motif": "", "statut": "INSTRUCTION", "userId": 1, "dateFin": "2020-10-07T18:52:09.797Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2019-10-07T18:52:09.797Z", "orientation": "", "dateDecision": "2019-10-07T18:53:06.510Z", "motifDetails": "", "orientationDetails": ""}, {"uuid": "c6aabd3b-7485-4efd-8c09-5080b91709d9", "statut": "ATTENTE_DECISION", "userId": 2, "dateFin": "2021-01-27T09:21:49.242Z", "typeDom": "PREMIERE_DOM", "userName": "Isabelle Juste", "dateDebut": "2019-10-07T19:28:10.777Z", "dateDecision": "2019-10-07T19:28:10.777Z", "orientationDetails": null}]	[{"nom": "Inspecteur", "lien": "enfant", "prenom": "Gadget", "dateNaissance": "1990-10-12T00:00:00.000Z"}]	{"appel": null, "visite": null, "colisIn": 0, "enAttente": false, "courrierIn": 0, "nbCourrier": 0, "courrierOut": null, "recommandeIn": 0, "recommandeOut": null, "dateInteraction": "2021-01-27T09:21:49.242Z"}	[{"label": "Carte identité", "filetype": "image/jpeg", "createdAt": "2019-10-07T18:53:32.922Z", "createdBy": "Patrick Roméro"}]	["8242ba1bc7f3c3971f761b6a347fc1c4.jpg"]	0	{"userId": 2, "dateRdv": "2019-10-07T19:30:02.675Z", "userName": "Juste Isabelle"}	{"cause": "cause5", "revenus": false, "residence": "HEBERGEMENT_TIERS", "causeDetail": null, "liencommune": null, "commentaires": null, "domiciliation": false, "accompagnement": true, "residenceDetail": null, "accompagnementDetail": "CCAS des mureaux"}	{"npai": {"actif": false}, "transfert": {"nom": null, "actif": false, "adresse": null}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}	\N	[]
5215f197-5f9b-4c2a-8b2e-60a0fcc5fc85	2021-06-28 13:26:31.533838+00	2021-06-28 13:27:25.50489+00	6	8	8	1	Smith	John		homme	2000-03-15 00:00:00+00	Londres	\N			{"phone": false, "phoneNumber": null}	\N	PREMIERE_DOM	{"motif": "LIEN_COMMUNE", "statut": "REFUS", "userId": 1, "dateFin": "2021-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-06-28T00:00:00.000Z", "orientation": "asso", "dateDecision": "2021-06-28T13:27:25.493Z", "motifDetails": null, "orientationDetails": "CCAS de sa commune"}	[{"uuid": "6d781a28-a5dc-4d95-826d-6aa0f78e5864", "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-06-28T13:26:31.533Z", "userName": "Patrick Roméro", "dateDecision": "2021-06-28T13:26:31.533Z"}, {"motif": "LIEN_COMMUNE", "statut": "REFUS", "userId": 1, "dateFin": "2021-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-06-28T00:00:00.000Z", "orientation": "asso", "dateDecision": "2021-06-28T13:27:25.493Z", "motifDetails": null, "orientationDetails": "CCAS de sa commune"}]	[]	{"colisIn": 0, "enAttente": false, "courrierIn": 0, "recommandeIn": 0, "dateInteraction": "2021-06-28T13:26:31.530Z"}	[]	[]	5	{"userId": 1, "dateRdv": "2021-06-28T13:25:42.151Z", "userName": "Patrick Roméro"}	{}	{"npai": {"actif": false}, "transfert": {"actif": false}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}	\N	[]
b2c26e55-ab37-457d-b307-6fe161050a9b	2021-06-28 13:24:22.924091+00	2021-10-05 09:47:58.10756+00	32	7	7	1	Dupont	Pauline	Paula	homme	1996-01-02 00:00:00+00	Paris	fr			{"phone": false, "phoneNumber": null}	2021-06-28 00:00:00+00	PREMIERE_DOM	{"statut": "VALIDE", "userId": 1, "dateFin": "2022-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-06-28T00:00:00.000Z", "dateDecision": "2021-06-28T13:25:20.685Z"}	[{"uuid": "db7ff8b2-66e3-47ee-9346-e080945b418e", "statut": "INSTRUCTION", "userId": 1, "dateFin": "2021-06-28T13:24:22.920Z", "userName": "Patrick Roméro", "dateDecision": "2021-06-28T13:24:22.920Z"}, {"statut": "VALIDE", "userId": 1, "dateFin": "2022-06-28T00:00:00.000Z", "typeDom": "PREMIERE_DOM", "userName": "Patrick Roméro", "dateDebut": "2021-06-28T00:00:00.000Z", "dateDecision": "2021-06-28T13:25:20.685Z"}]	[{"nom": "Dupont", "lien": "ENFANT", "prenom": "Paulin", "dateNaissance": "2015-08-15T00:00:00.000Z"}, {"nom": "Dupont", "lien": "ENFANT", "prenom": "Sophie", "dateNaissance": "2018-12-03T00:00:00.000Z"}]	{"colisIn": 1, "enAttente": true, "courrierIn": 2, "recommandeIn": 0, "dateInteraction": "2021-06-28T13:25:36.004Z"}	[]	[]	5	{"userId": 1, "dateRdv": "2021-06-28T13:23:27.041Z", "userName": "Patrick Roméro"}	{"cause": "RUPTURE", "raison": "AUTRE", "revenus": false, "residence": "HEBERGEMENT_TIERS", "typeMenage": "FEMME_ISOLE_AVEC_ENFANT", "causeDetail": null, "liencommune": null, "orientation": false, "commentaires": "Ceci est un commentaire sur l\'entretien", "raisonDetail": null, "rattachement": null, "domiciliation": true, "revenusDetail": null, "accompagnement": false, "residenceDetail": null, "orientationDetail": null, "accompagnementDetail": null}	{"npai": {"actif": false}, "transfert": {"actif": false}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}, "portailUsagerEnabled": true}	\N	[]
\.


--
-- Data for Name: interactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.interactions (uuid, "createdAt", "updatedAt", version, "dateInteraction", "nbCourrier", "structureId", type, "usagerRef", "userId", "userName", content, "usagerUUID", event, "previousValue") FROM stdin;
4fc32424-3f6e-48c7-9ef1-02b9db388445	2020-11-18 11:01:52.072912+00	2020-11-18 11:01:52.072912+00	1	2020-11-01 18:47:00.286	3	1	recommandeIn	1	1	Patrick Roméro		860ffa4c-88c4-4e1c-ad42-5a05cdf39830	create	\N
44ba43d0-ab44-4449-a6e1-40cbcbc92adc	2020-11-18 11:01:52.072912+00	2020-11-18 11:01:52.072912+00	1	2020-11-01 18:47:03.303	4	1	colisIn	1	1	Patrick Roméro		860ffa4c-88c4-4e1c-ad42-5a05cdf39830	create	\N
b174770d-dfb4-45ea-bf5c-58f1288ff6dd	2020-11-18 11:01:52.072912+00	2020-11-18 11:01:52.072912+00	1	2020-11-01 18:47:06.168	1	1	courrierIn	1	1	Patrick Roméro		860ffa4c-88c4-4e1c-ad42-5a05cdf39830	create	\N
086a249e-67ea-462c-bb84-4aac5bf0b854	2020-11-18 11:01:52.072912+00	2020-11-18 11:01:52.072912+00	1	2020-11-01 18:41:28.157	1	1	courrierIn	2	1	Patrick Roméro		97b7e840-0e93-4bf4-ba7d-0a406aa898f2	create	\N
f5200bf7-4ec7-4331-b931-fe36df84014a	2020-11-18 11:01:52.072912+00	2020-11-18 11:01:52.072912+00	1	2020-11-01 18:46:51.913	1	1	courrierIn	2	1	Patrick Roméro		97b7e840-0e93-4bf4-ba7d-0a406aa898f2	create	\N
656aa50a-0a2c-4fe3-a312-8b694aa5f9ec	2020-11-18 11:01:52.072912+00	2020-11-18 11:01:52.072912+00	1	2020-11-01 18:46:53.24	1	1	courrierIn	2	1	Patrick Roméro		97b7e840-0e93-4bf4-ba7d-0a406aa898f2	create	\N
05706b0a-4434-4e90-8288-b58f2fe17c33	2020-11-18 11:01:52.072912+00	2020-11-18 11:01:52.072912+00	1	2020-11-01 18:46:54.143	0	1	visite	2	1	Patrick Roméro		97b7e840-0e93-4bf4-ba7d-0a406aa898f2	create	\N
b68794a5-1d02-48ca-9cc7-8b43b4a4bbf0	2021-06-28 13:25:28.404973+00	2021-06-28 13:25:28.404973+00	1	2021-06-28 15:25:28.404	2	1	courrierIn	7	1	Patrick Roméro		b2c26e55-ab37-457d-b307-6fe161050a9b	create	\N
fb8dde95-b421-4cf0-b205-9e940d9641e5	2021-06-28 13:25:28.512802+00	2021-06-28 13:25:28.512802+00	1	2021-06-28 15:25:28.512	1	1	colisIn	7	1	Patrick Roméro		b2c26e55-ab37-457d-b307-6fe161050a9b	create	\N
0a0dbf1d-055f-47db-b2ae-013c611033e8	2021-06-28 13:25:33.70286+00	2021-06-28 13:25:33.70286+00	1	2021-06-28 15:25:33.702	1	1	colisIn	7	1	Patrick Roméro	\N	b2c26e55-ab37-457d-b307-6fe161050a9b	create	\N
f3b49608-cb17-4fdb-b793-8da431cd6ffe	2021-06-28 13:25:35.998265+00	2021-06-28 13:25:35.998265+00	1	2021-06-28 15:25:35.997	2	1	courrierOut	7	1	Patrick Roméro	\N	b2c26e55-ab37-457d-b307-6fe161050a9b	create	\N
53a50f2d-c906-421e-be21-8857dfca97fc	2021-06-28 13:25:36.005054+00	2021-06-28 13:25:36.005054+00	1	2021-06-28 15:25:36.004	2	1	colisOut	7	1	Patrick Roméro	\N	b2c26e55-ab37-457d-b307-6fe161050a9b	create	\N
7d27aea0-d9ae-4529-b1ee-e40a4eadf1ab	2021-06-28 13:25:37.471534+00	2021-06-28 13:25:37.471534+00	1	2021-06-28 15:25:37.47	1	1	courrierIn	7	1	Patrick Roméro	\N	b2c26e55-ab37-457d-b307-6fe161050a9b	create	\N
212f8184-972a-4cb3-ae83-d1738659cbf9	2021-06-28 13:25:45.842905+00	2021-06-28 13:25:45.842905+00	1	2021-06-28 15:25:45.842	1	1	courrierIn	7	1	Patrick Roméro	Courrier très important	b2c26e55-ab37-457d-b307-6fe161050a9b	create	\N
8abd81e6-403f-49f3-999a-0ead3e6456c5	2021-06-28 13:25:51.252592+00	2021-06-28 13:25:51.252592+00	1	2021-06-28 15:25:51.252	1	1	colisIn	7	1	Patrick Roméro	\N	b2c26e55-ab37-457d-b307-6fe161050a9b	create	\N
\.


--
-- Data for Name: message_email; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_email (uuid, "createdAt", "updatedAt", version, status, "emailId", "initialScheduledDate", "nextScheduledDate", "sendDate", content, "errorCount", "errorMessage", "sendDetails", attachments) FROM stdin;
1a8fc8f6-bc6b-40fb-b2ed-b4e1af5cb4b5	2021-01-26 09:04:24.386282+00	2021-01-26 09:04:24.386282+00	1	pending	user-reset-password	2021-01-26 09:04:24.381+00	2021-01-26 09:04:24.381+00	\N	{"to": [{"address": "ccastest@yopmail.com", "personalName": "Roméro Patrick"}], "from": {"personalName": "Domifa"}, "replyTo": {"personalName": "Domifa"}, "subject": "Demande d\'un nouveau mot de passe", "tipimailModels": [{"email": "ccastest@yopmail.com", "values": {"lien": "http://localhost:4200/reset-password/3d6a46c1ce375273a5db76838c6b5c73feb0bf97f88fa40698b67c2a97eb", "prenom": "Patrick"}, "subject": "Demande d\'un nouveau mot de passe"}], "tipimailTemplateId": "users-nouveau-mot-de-passe"}	0	\N	\N	\N
3192eafb-b86d-4f2f-ad6c-f7f7df01508a	2021-02-01 16:12:30.914556+00	2021-02-01 16:12:30.914556+00	1	pending	structure-created	2021-02-01 16:12:30.914+00	2021-02-01 16:12:30.914+00	\N	{"to": [{"personalName": "Domifa"}], "from": {"personalName": "Domifa"}, "replyTo": {"personalName": "Domifa"}, "subject": "Nouvelle structure sur Domifa ", "tipimailModels": [{"meta": {}, "values": {"email": "test.import@yopmail.com", "phone": "0101010101", "ville": "Nantes", "adresse": "rue de l\'import", "user_nom": "Test", "user_email": "test.import@yopmail.com", "code_postal": "44000", "departement": "Loire-Atlantique", "user_prenom": "Import", "structure_name": "Structure de Test d\'import", "structure_type": "Organisme agrée", "responsable_nom": "Test", "lien_suppression": "http://localhost:4200/structures/delete/4/63ba3e786570cfc32fdc9d2d46b365cb23d4b955df308579ffd0ab0f23c7", "lien_confirmation": "http://localhost:4200/structures/confirm/4/63ba3e786570cfc32fdc9d2d46b365cb23d4b955df308579ffd0ab0f23c7", "responsable_prenom": "Import", "responsable_fonction": "Testeur"}, "subject": "Nouvelle structure sur Domifa "}], "tipimailTemplateId": "domifa-nouvelle-structure"}	0	\N	\N	\N
3e6f55be-2f38-4dad-8bcf-16551f9154e7	2021-02-01 16:13:04.645677+00	2021-02-01 16:13:04.645677+00	1	pending	user-account-activated	2021-02-01 16:13:04.644+00	2021-02-01 16:13:04.644+00	\N	{"to": [{"address": "test.import@yopmail.com", "personalName": "Import Test"}], "from": {"personalName": "Domifa"}, "replyTo": {"personalName": "Domifa"}, "subject": "Votre compte Domifa a été activé", "tipimailModels": [{"meta": {}, "email": "test.import@yopmail.com", "values": {"lien": "http://localhost:4200/", "prenom": "Import", "nom_structure": "Structure de Test d\'import"}, "subject": "Votre compte Domifa a été activé"}], "tipimailTemplateId": "users-compte-active"}	0	\N	\N	\N
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
-- Data for Name: usager_history; Type: TABLE DATA; Schema: public; Owner: -
--


--
-- Data for Name: user_structure; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_structure (uuid, "createdAt", "updatedAt", version, email, fonction, id, "lastLogin", nom, password, prenom, role, "structureId", mails, "passwordLastUpdate", verified) FROM stdin;
663b9baa-2880-406c-a93a-32fe65528037	2020-11-17 13:18:47.658346+00	2020-11-17 13:18:47.658346+00	1	justeisabelle@yopmail.com	\N	2	\N	Juste	$2a$10$3yXcVfWYOWsI/KzAwZ0BrOay1Dp/ZOF5RjhLL0QA2Pt7gQVg2U86u	Isabelle	simple	1	{"guide": false, "import": false}	\N	t
d81c5566-94f9-4ee4-ab57-a604a654f79b	2020-11-17 13:32:22.193933+00	2020-11-17 13:39:14.015103+00	17	roseline.parmentier@yopmail.com	\N	5	2020-11-17 13:39:13.796+00	Roseline	$2a$10$3yXcVfWYOWsI/KzAwZ0BrOay1Dp/ZOF5RjhLL0QA2Pt7gQVg2U86u	Parmentier	admin	3	{"guide": false, "import": false}	2020-11-17 13:39:14.013+00	t
b0140303-79e3-436c-9c41-1eaefeeaed6e	2020-11-17 13:23:20.248011+00	2020-11-17 13:23:20.257747+00	2	peter.smith@yopmail.com	\N	3	\N	Smith	$2a$10$3yXcVfWYOWsI/KzAwZ0BrOay1Dp/ZOF5RjhLL0QA2Pt7gQVg2U86u	Peter	responsable	1	{"guide": false, "import": false}	\N	t
d19ece1f-d32b-498c-9427-eb12b1251163	2020-11-17 13:26:29.482634+00	2020-11-17 13:26:29.490297+00	2	facteur.test@yopmail.com	\N	4	\N	Test	$2a$10$3yXcVfWYOWsI/KzAwZ0BrOay1Dp/ZOF5RjhLL0QA2Pt7gQVg2U86u	Facteur	facteur	1	{"guide": false, "import": false}	\N	f
44f1cfe8-eae9-49d5-aedb-76dda856c413	2021-02-01 16:12:30.90825+00	2021-02-01 16:13:04.64034+00	2	test.import@yopmail.com	Testeur	7	\N	Test	$2a$10$3yXcVfWYOWsI/KzAwZ0BrOay1Dp/ZOF5RjhLL0QA2Pt7gQVg2U86u	Import	admin	4	{"guide": false, "import": false}	\N	t
59c846d8-0592-4790-a5e2-1daae9b8776e	2020-11-14 13:18:27.658736+00	2020-11-14 13:18:27.658736+00	1	structure-1.facteur-1@yopmail.com	\N	6	2021-06-28 13:27:26.095+00	Dupuis	$2a$10$3yXcVfWYOWsI/KzAwZ0BrOay1Dp/ZOF5RjhLL0QA2Pt7gQVg2U86u	Facteur 1	facteur	1	{"guide": true, "import": true}	\N	t
4e049e3d-bb65-48e5-8661-b1ccdc9db985	2021-09-20 22:03:26.186917+00	2021-09-20 22:03:26.186917+00	2	simple-testeur@yopmail.com	Simple testeur	8	\N	Jacquet	$2a$10$3yXcVfWYOWsI/KzAwZ0BrOay1Dp/ZOF5RjhLL0QA2Pt7gQVg2U86u	Aimé	simple	3	{"guide": false, "import": false}	\N	t
da01f451-9c4f-4f6c-98bb-c635277e33e7	2020-11-17 13:18:47.658346+00	2021-10-05 09:47:58.094374+00	230	ccastest@yopmail.com	\N	1	2021-10-05 09:47:58.093+00	Roméro	$2a$10$3yXcVfWYOWsI/KzAwZ0BrOay1Dp/ZOF5RjhLL0QA2Pt7gQVg2U86u	Patrick	admin	1	{"guide": false, "import": false}	\N	t
\.


--
-- Data for Name: user_structure_security; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_structure_security (uuid, "createdAt", "updatedAt", version, "userId", "structureId", "temporaryTokens", "eventsHistory") FROM stdin;
7aef1d02-3021-4988-937c-f18fa6244b14	2021-03-15 15:53:55.740856+00	2021-03-15 15:53:55.740856+00	1	2	1	\N	[]
0068d982-390a-4c42-9b63-55f5c78c6cfd	2021-03-15 15:53:55.740856+00	2021-03-15 15:53:55.740856+00	1	5	3	\N	[]
9fe998b5-7178-44b5-9c40-2e18ba233f1d	2021-03-15 15:53:55.740856+00	2021-03-15 15:53:55.740856+00	1	3	1	\N	[]
e931e0d8-ecbb-478a-97a3-a01eac88e24f	2021-03-15 15:53:55.740856+00	2021-03-15 15:53:55.740856+00	1	4	1	\N	[]
3e2118c1-1e0b-4ce7-bc85-22001eebc8ee	2021-03-15 15:53:55.740856+00	2021-03-15 15:53:55.740856+00	1	7	4	\N	[]
8dddd469-7b63-44f3-8166-15830e80ee7b	2021-03-15 15:53:55.740856+00	2021-03-15 15:53:55.740856+00	1	6	1	\N	[]
759bdc26-be9d-4ffb-95c9-8c2d7a06a63b	2021-03-15 15:53:55.740856+00	2021-03-15 15:53:55.740856+00	1	8	3	\N	[]
e0bcefc6-f1be-4c83-ac9d-6ea47335a9c3	2021-03-15 15:53:55.740856+00	2021-10-05 09:24:46.460174+00	2	1	1	\N	[{"date": "2021-10-05T09:24:46.451Z", "type": "login-success"}]
\.


--
-- Data for Name: user_usager; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_usager (uuid, "createdAt", "updatedAt", version, id, "usagerUUID", "structureId", login, password, salt, "isTemporaryPassword", "lastLogin", "passwordLastUpdate", "lastPasswordResetDate", "lastPasswordResetStructureUser", enabled) FROM stdin;
a657f4bd-e4d1-4c38-bdd0-ffd268b356df	2021-10-05 09:34:41.369505+00	2021-10-05 09:48:50.852639+00	17	1	b2c26e55-ab37-457d-b307-6fe161050a9b	1	WKYJBDXS	$2a$10$kuY0YZ4MihZGY7KKNk/Tv.Wd0Y5uCcFCHjp/8BOD9ltFo/EWZD2n.	$2a$10$kuY0YZ4MihZGY7KKNk/Tv.	t	2021-10-05 09:48:50.831+00	\N	2021-10-05 09:34:41.365+00	{"userId": 1, "userName": "Patrick Roméro"}	t
\.


--
-- Data for Name: user_usager_security; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_usager_security (uuid, "createdAt", "updatedAt", version, "userId", "structureId", "eventsHistory") FROM stdin;
9bc8decb-5f78-48de-8c1b-9f61ea5acfba	2021-10-05 09:34:41.388922+00	2021-10-05 09:48:50.82774+00	2	1	1	[{"date": "2021-10-05T09:48:50.826Z", "type": "login-success"}]
\.


--
-- Name: structure_doc_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.structure_doc_id_seq', 1, false);


--
-- Name: structure_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.structure_id_seq', 4, true);


--
-- Name: user_structure_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_structure_id_seq', 8, true);


--
-- Name: user_usager_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_usager_id_seq', 1, true);


--
-- PostgreSQL database dump complete
--

