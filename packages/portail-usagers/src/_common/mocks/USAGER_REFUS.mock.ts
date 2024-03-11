import { PortailUsagerPublic } from "@domifa/common";

export const USAGER_REFUS_MOCK: PortailUsagerPublic = {
  ref: 1,
  decision: {
    uuid: "x",
    orientationDetails: "",
    statut: "REFUS",
    dateDebut: new Date("2020-02-12T00:00:00.000Z"),
    dateDecision: new Date("2020-02-12T00:00:00.000Z"),
    dateFin: new Date("2021-02-12T00:00:00.000Z"),
    motif: "NON_MANIFESTATION_3_MOIS",
    typeDom: "PREMIERE_DOM",
    motifDetails: "",
    userId: 30,
    userName: "Testeur Robin",
  },
  lastInteraction: {
    colisIn: 0,
    courrierIn: 0,
    enAttente: false,
    recommandeIn: 0,
    dateInteraction: new Date("2020-12-01T14:11:28.167Z"),
  },
  options: {
    portailUsagerEnabled: true,
    npai: {
      actif: false,
    },
    procurations: [],
    transfert: {
      actif: false,
      adresse: null,
      nom: null,
    },
  },
  contactByPhone: false,
  rdv: null,
  ayantsDroits: [
    {
      nom: "Karamoko",
      prenom: "Mauricette",
      dateNaissance: new Date("1978-12-20T00:00:00.000Z"),
      lien: "CONJOINT",
    },
  ],
  datePremiereDom: new Date("2018-01-11T00:00:00.000Z"),

  email: "domicilie2@yopmail.com",
  etapeDemande: 5,
  historique: [
    {
      uuid: "x",
      dateDebut: new Date("2020-12-01T10:00:24.980Z"),
      dateDecision: new Date("2020-12-01T10:00:24.980Z"),
      dateFin: new Date("2020-12-01T10:00:24.980Z"),
      motif: undefined,
      statut: "INSTRUCTION",
      userId: 30,
      userName: "Testeur Robin",
      typeDom: "PREMIERE_DOM",
    },
  ],

  telephone: { countryCode: "fr", numero: "0142424242" },
  surnom: "",
  typeDom: "RENOUVELLEMENT",
  customRef: "5",
  dateNaissance: new Date("1998-08-07T00:00:00.000Z"),
  nom: "Martine",
  prenom: "Sembat",
  sexe: "femme",
  structureId: 1,
  villeNaissance: "Bouaké, Côte d'Ivoire",

  createdAt: new Date("2020-12-01T10:00:24.984Z"),
  updatedAt: new Date("2020-12-21T17:07:12.911Z"),
};
