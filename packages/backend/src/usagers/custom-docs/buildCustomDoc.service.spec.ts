import { StructureCustomDoc, UsagerLight } from "../../_common/model";
import { buildCustomDoc } from "./buildCustomDoc.service";
import {
  generatedAttestationMock,
  generatedRadiationMock,
  structureMock,
} from "./mocks";

describe("ATTESTATION POSTALE", () => {
  const usagerActif: UsagerLight = {
    notes: [],
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
    phone: "0101010101",
    preference: { email: false, phone: false },
    typeDom: "PREMIERE_DOM",
    decision: {
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
        statut: "INSTRUCTION",
        userId: 1,
        dateFin: new Date("2020-11-01T00:00:00.000Z"),
        userName: "Patrick Roméro",
        dateDecision: new Date("2020-11-01T00:00:00.000Z"),
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
    docs: [],
    etapeDemande: 5,
    rdv: {
      userId: 1,
      dateRdv: new Date("2020-11-01T00:00:00.000Z"),
      userName: "Roméro Patrick",
    },
    entretien: {
      cause: "VIOLENCE",
      raison: "EXERCICE_DROITS",
      revenus: true,
      residence: "HEBERGEMENT_TIERS",
      typeMenage: "FEMME_ISOLE_AVEC_ENFANT",
      causeDetail: null,
      liencommune: null,
      orientation: false,
      commentaires: null,
      raisonDetail: null,
      rattachement: null,
      domiciliation: true,
      revenusDetail: null,
      accompagnement: false,
      residenceDetail: null,
      orientationDetail: null,
      accompagnementDetail: null,
    },
    options: {
      npai: { actif: false },
      transfert: { nom: null, actif: false, adresse: null },
      historique: { transfert: [], procuration: [] },
      procuration: { actif: false },
    },
  };

  it("Generate data for render", async () => {
    const date = new Date("2020-12-15 14:30:00");
    const docActif: StructureCustomDoc = buildCustomDoc(
      usagerActif,
      structureMock,
      date
    );

    expect(docActif).toEqual(generatedAttestationMock);
  });
});

describe("ATTESTATION RADIATION", () => {
  const usagerRadie: UsagerLight = {
    notes: [],
    uuid: "ebee4605-6262-472d-82e3-d56935830764",
    ref: 10,
    customRef: "10",
    structureId: 1,
    nom: "DUPONT",
    prenom: "PATRICK",
    surnom: "",
    sexe: "homme",
    dateNaissance: new Date("1969-09-09T00:00:00.000Z"),
    villeNaissance: "Marseille",
    langue: null,
    email: "montest@yopmail.com",
    phone: "0142494242",
    datePremiereDom: new Date("2018-10-01T00:00:00.000Z"),
    preference: { phone: false, phoneNumber: null, email: null },
    typeDom: "PREMIERE_DOM",
    decision: {
      motif: "ENTREE_LOGEMENT",
      statut: "RADIE",
      userId: 28,
      dateFin: new Date("2021-05-18T16:19:48.046Z"),
      userName: "PO TEST",
      dateDebut: new Date("2021-05-18T16:19:48.046Z"),
      dateDecision: new Date("2021-02-19T16:19:48.041Z"),
      motifDetails: "",
    },
    historique: [
      {
        statut: "VALIDE",
        userId: 28,
        dateFin: new Date("2022-04-17T00:00:00.000Z"),
        userName: "PO TEST",
        dateDebut: new Date("2021-04-19T00:00:00.000Z"),
        dateDecision: new Date("2022-03-19T14:01:17.322Z"),
      },
      {
        statut: "INSTRUCTION",
        userId: 28,
        dateFin: new Date("2021-04-07T14:01:09.187Z"),
        userName: "PO TEST",
        dateDecision: new Date("2021-04-07T14:01:09.187Z"),
      },
      {
        statut: "VALIDE",
        userId: 28,
        dateFin: new Date("2020-04-17T00:00:00.000Z"),
        userName: "PO TEST",
        dateDebut: new Date("2019-04-19T00:00:00.000Z"),
        dateDecision: new Date("2020-03-19T14:01:17.322Z"),
      },
    ],
    ayantsDroits: [],
    lastInteraction: {
      colisIn: 0,
      enAttente: false,
      courrierIn: 0,
      recommandeIn: 0,
      dateInteraction: new Date("2021-06-10T00:00:00.000Z"),
    },
    docs: [],
    etapeDemande: 5,
    rdv: {
      userId: 28,
      dateRdv: new Date("2021-04-07T14:00:10.570Z"),
      userName: "PO TEST",
    },
    entretien: {},
    options: {
      npai: { actif: false },
      transfert: { actif: false },
      historique: { transfert: [], procuration: [] },
      procuration: { actif: false },
    },
  };
  it("Generate data for render", async () => {
    const date = new Date("2020-12-15 14:30:00");
    const docRadiation: StructureCustomDoc = buildCustomDoc(
      usagerRadie,
      structureMock,
      date
    );

    expect(docRadiation).toEqual(generatedRadiationMock);
  });
});
