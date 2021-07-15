import { UsagerLight } from "../model";
import { ETAPE_DOSSIER_COMPLET } from "../model/usager/constants";

export const USAGER_ACTIF_MOCK: UsagerLight = {
  decision: {
    orientationDetails: null,
    statut: "VALIDE",
    dateDebut: new Date("2020-02-12T00:00:00.000Z"),
    dateDecision: new Date("2020-02-12T00:00:00.000Z"),
    dateFin: new Date("2021-02-12T00:00:00.000Z"),
    motif: undefined,
    typeDom: undefined,
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
    npai: { actif: false },
    procuration: { actif: false },
    transfert: { actif: false, adresse: null, nom: null },
    historique: { transfert: [], procuration: [] },
  },
  preference: { email: false, phone: false, phoneNumber: "0606060606" },
  rdv: { dateRdv: null, userId: 0, userName: "" },
  ayantsDroits: [
    {
      nom: "Karamoko",
      prenom: "Mauricette",
      dateNaissance: new Date("1978-12-20T00:00:00.000Z"),
      lien: "CONJOINT",
    },
  ],
  datePremiereDom: new Date("2018-01-11T00:00:00.000Z"),
  docs: [
    {
      createdAt: new Date("2020-12-21T17:05:15.113Z"),
      createdBy: "TEST USER",
      filetype: "application/pdf",
      label: "Document",
    },
    {
      createdAt: new Date("2020-12-21T17:07:12.911Z"),
      createdBy: "TEST USER",
      filetype: "image/jpeg",
      label: "Document",
    },
  ],

  email: "domicilie2@yopmail.com",
  entretien: {
    typeMenage: "COUPLE_AVEC_ENFANT",
    domiciliation: false,
    revenus: false,
    orientation: true,
    orientationDetail: "Test orientation",
    raison: "PRESTATIONS_SOCIALES",
    liencommune: "SOCIAL",
    liencommuneDetail: "Suivi social",
    residence: "DOMICILE_MOBILE",
    cause: "EXPULSION",
    commentaires: "Ceci est un commentaire",
  },
  etapeDemande: ETAPE_DOSSIER_COMPLET,
  historique: [
    {
      dateDebut: new Date("2020-12-01T10:00:24.980Z"),
      dateDecision: new Date("2020-12-01T10:00:24.980Z"),
      dateFin: new Date("2020-12-01T10:00:24.980Z"),
      motif: undefined,
      statut: "INSTRUCTION",
      userId: 30,
      userName: "Testeur Robin",
      typeDom: undefined,
    },
  ],

  phone: "0142424242",
  surnom: "",
  import: {
    date: new Date("2020-12-01T10:00:24.980Z"),
    userId: 30,
    userName: "Testeur Robin",
  },
  typeDom: "RENOUVELLEMENT",

  customRef: "5",
  dateNaissance: new Date("1998-08-07T00:00:00.000Z"),
  nom: "Martine",
  prenom: "Sembat",
  sexe: "femme",
  structureId: 1,
  villeNaissance: "Bouaké, Côte d'Ivoire",
  ref: 5,
  createdAt: new Date("2020-12-01T10:00:24.984Z"),
  updatedAt: new Date("2020-12-21T17:07:12.911Z"),
};
