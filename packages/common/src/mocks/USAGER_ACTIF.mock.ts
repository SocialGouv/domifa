import { ETAPE_DOSSIER_COMPLET, Usager } from "../usager";
import {
  UsagerOptionsProcuration,
  UsagerOptionsTransfert,
} from "../usager-options";

export const USAGER_VALIDE_MOCK: Usager = {
  numeroDistribution: null,
  statut: "VALIDE",
  decision: {
    uuid: "",
    statut: "VALIDE",
    dateDebut: new Date("2020-02-12T00:00:00.000Z"),
    dateDecision: new Date("2020-02-12T00:00:00.000Z"),
    dateFin: new Date("2021-02-12T00:00:00.000Z"),
    motif: "LIEN_COMMUNE",
    typeDom: "PREMIERE_DOM",
    orientation: "other",
    orientationDetails: "DETAILS",
    motifDetails: "DETAILS",
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
  pinnedNote: null,
  options: {
    transfert: new UsagerOptionsTransfert(),
    procurations: [new UsagerOptionsProcuration()],
    npai: {
      actif: false,
      dateDebut: null,
    },
    portailUsagerEnabled: false,
  },
  contactByPhone: false,
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
    revenusDetail: null,
    residenceDetail: null,
    causeDetail: null,
    rattachement: null,
    raisonDetail: null,
    accompagnement: null,
    accompagnementDetail: null,
    usagerUUID: "",
    structureId: 1,
    usagerRef: 1,
    situationPro: null,
    situationProDetail: null,
  },
  etapeDemande: ETAPE_DOSSIER_COMPLET,
  historique: [
    {
      statut: "VALIDE",
      dateDebut: new Date("2020-02-12T00:00:00.000Z"),
      dateDecision: new Date("2020-02-12T00:00:00.000Z"),
      dateFin: new Date("2021-02-12T00:00:00.000Z"),
      motif: null,
      typeDom: "PREMIERE_DOM",
      motifDetails: "",
      userId: 30,
      userName: "Testeur Robin",
      uuid: "",
    },
    {
      uuid: "",
      dateDebut: new Date("2020-12-01T10:00:24.980Z"),
      dateDecision: new Date("2020-12-01T10:00:24.980Z"),
      dateFin: new Date("2020-12-01T10:00:24.980Z"),
      motif: null,
      motifDetails: "",
      statut: "INSTRUCTION",
      userId: 30,
      userName: "Testeur Robin",
      typeDom: "PREMIERE_DOM",
    },
  ],
  telephone: { countryCode: "FR", numero: "0606060606" },
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
