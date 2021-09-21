import { UsagerPublic } from "../usager";

export const DEFAULT_USAGER: UsagerPublic = {
  ayantsDroits: [
    {
      dateNaissance: new Date("1978-12-20T00:00:00.000Z"),
      lien: "CONJOINT",
      nom: "Karamoko",
      prenom: "Mauricette",
    },
  ],
  customRef: "5",
  dateNaissance: new Date("1998-08-07T00:00:00.000Z"),
  datePremiereDom: new Date("2018-01-11T00:00:00.000Z"),
  decision: {
    dateDebut: new Date("2020-02-12T00:00:00.000Z"),
    dateDecision: new Date("2020-02-12T00:00:00.000Z"),
    dateFin: new Date("2021-02-12T00:00:00.000Z"),
    motif: undefined,
    motifDetails: "",
    statut: "VALIDE",
    typeDom: "PREMIERE_DOM",
    userId: 30,
    userName: "Testeur Robin",
  },
  // CONTACT
  email: "",
  etapeDemande: 0,
  // visible history
  historique: [],
  lastInteraction: {
    colisIn: 2,
    courrierIn: 12,
    dateInteraction: new Date("2020-12-01T14:11:28.167Z"),
    enAttente: true,
    recommandeIn: 10,
  },
  nom: "Martine",
  options: {
    historique: {
      procuration: [],
      transfert: [],
    },
    npai: {
      actif: false,
    },
    procuration: {
      actif: false,
    },
    transfert: {
      actif: false,
      adresse: null,
      nom: null,
    },
  },
  phone: "",
  preference: {
    email: false,
    phone: false,
    phoneNumber: "0606060606",
  },
  prenom: "Sembat",
  rdv: null,
  ref: 5,
  sexe: "femme",
  structureId: 1,
  typeDom: "RENOUVELLEMENT",
  villeNaissance: "Bouaké, Côte d'Ivoire",
};
