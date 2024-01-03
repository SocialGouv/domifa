import { Usager } from "../../model";

export const USAGER_VALIDE_MOCK: Usager = {
  numeroDistribution: "",
  uuid: "ee7ef219-b101-422c-8ad4-4d5aedf9caad",
  ref: 6,
  customRef: "6",
  structureId: 1,
  nom: "NOUVEAU",
  prenom: "DOSSIER",
  surnom: "TEST",
  sexe: "homme",
  dateNaissance: new Date("1988-11-02T00:00:00.000Z"),
  datePremiereDom: new Date("2018-10-01T00:00:00.000Z"),
  villeNaissance: "Paris",
  langue: null,
  email: "fake-mail@yopmail.com",
  pinnedNote: null,
  telephone: { countryCode: "fr", numero: "0606060606" },
  contactByPhone: false,
  typeDom: "PREMIERE_DOM",
  decision: {
    uuid: "2X",
    statut: "VALIDE",
    userId: 1,
    dateFin: new Date("2021-10-31T00:00:00.000Z"),
    userName: "Patrick Roméro",
    dateDebut: new Date("2020-11-01T00:00:00.000Z"),
    dateDecision: new Date("2020-11-01T00:00:00.000Z"),
    orientationDetails: null,
  },
  historique: [
    {
      uuid: "2X",
      statut: "INSTRUCTION",
      userId: 1,
      dateFin: new Date("2020-11-01T00:00:00.000Z"),
      userName: "Patrick Roméro",
      dateDecision: new Date("2020-11-01T00:00:00.000Z"),
      dateDebut: new Date("2020-11-01T00:00:00.000Z"),
      orientationDetails: null,
    },
  ],
  ayantsDroits: [],
  lastInteraction: {
    colisIn: 0,
    enAttente: false,
    courrierIn: 0,
    recommandeIn: 0,
    dateInteraction: new Date("2020-11-01T00:00:00.000Z"),
  },
  etapeDemande: 5,
  rdv: {
    userId: 1,
    dateRdv: new Date("2020-11-01T00:00:00.000Z"),
    userName: "Roméro Patrick",
  },
  entretien: {
    uuid: "xx",
    usagerRef: 6,
    usagerUUID: "ee7ef219-b101-422c-8ad4-4d5aedf9caad",
    structureId: 1,
    cause: "VIOLENCE",
    raison: "EXERCICE_DROITS",
    revenus: true,
    residence: "HEBERGEMENT_TIERS",
    typeMenage: "FEMME_ISOLE_AVEC_ENFANT",
    domiciliation: true,
    commentaires: null,
    revenusDetail: null,
    orientation: null,
    orientationDetail: null,
    liencommune: null,
    liencommuneDetail: null,
    residenceDetail: null,
    causeDetail: null,
    rattachement: null,
    raisonDetail: null,
    accompagnement: null,
    accompagnementDetail: null,
    situationPro: null,
  },
  options: {
    transfert: {
      actif: false,
      nom: null,
      adresse: null,
      dateDebut: null,
      dateFin: null,
    },
    procurations: [],
    npai: {
      actif: false,
      dateDebut: null,
    },
    portailUsagerEnabled: false,
  },
};
