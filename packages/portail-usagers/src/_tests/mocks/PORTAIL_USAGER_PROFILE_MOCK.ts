import { PortailUsagerProfile, PortailUsagerPublic } from "@domifa/common";

const usager: PortailUsagerPublic = {
  uuid: "4dcdcddc-fad2-4827-aac5-0acf1df7b5bc",
  ref: 5,
  customRef: "5",
  structureId: 1,
  nom: "Derick",
  prenom: "Inspecteur",
  sexe: "homme",
  dateNaissance: new Date("1911-05-24T00:00:00.000Z"),
  villeNaissance: "Dreux",
  email: null,
  telephone: {
    numero: "",
    countryCode: "FR",
  },
  contactByPhone: false,
  datePremiereDom: new Date("2025-08-13T00:00:00.000Z"),
  typeDom: "PREMIERE_DOM",
  decision: {
    uuid: "4328c843-e4bd-432d-b60b-b72a13ee3c9c",
    statut: "VALIDE",
    userId: 1,
    typeDom: "PREMIERE_DOM",
    dateFin: new Date("2026-08-12T00:00:00.000Z"),
    userName: "Patrick Roméro",
    dateDebut: new Date("2025-08-13T00:00:00.000Z"),
    dateDecision: new Date("2025-08-13T14:29:36.624Z"),
  },
  historique: [],
  ayantsDroits: [],
  lastInteraction: {
    colisIn: 0,
    enAttente: false,
    courrierIn: 0,
    recommandeIn: 0,
    dateInteraction: new Date("2025-08-13T00:00:00.000Z"),
  },
  etapeDemande: 5,
  rdv: {
    userId: 2,
    dateRdv: new Date("2019-10-07T19:30:02.675Z"),
    userName: "Juste Isabelle",
  },
  options: {
    transfert: {
      nom: "",
      dateDebut: null,
      dateFin: null,
      isExpired: false,
      adresse: null,
      actif: false,
    },
    procurations: [],
    portailUsagerEnabled: true,
    npai: {
      actif: false,
      dateDebut: null,
    },
  },
};

export const unProfilUsager: PortailUsagerProfile = {
  acceptTerms: new Date(),
  usager: usager,
};
