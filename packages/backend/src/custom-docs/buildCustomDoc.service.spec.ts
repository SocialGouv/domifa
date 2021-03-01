import { UsagerLight } from "../database";
import { StructureCommon } from "../_common/model";
import { StructureCustomDoc } from "../_common/model/structure-doc/StructureCustomDoc.type";

import { buildCustomDoc } from "./buildCustomDoc.service";
import { generatedAttestationMock } from "./generatedAttestationMock";

describe("buildCustomDoc", () => {
  const structure: StructureCommon = {
    id: 1,
    adresse: "1 rue de l'océan",
    adresseCourrier: null,
    agrement: null,
    capacite: null,
    codePostal: "92600",
    complementAdresse: null,
    departement: "92",
    region: "11",
    email: "ccas.test@yopmail.com",
    nom: "CCAS de Test",
    options: { numeroBoite: false },
    phone: "0602030405",
    responsable: { nom: "Jean", prenom: "Thomson", fonction: "PDG" },
    structureType: "ccas",
    ville: "Asnieres-sur-seine",
  };
  // const usagerRadie: UsagerLight = {};

  const usagerActif: UsagerLight = {
    uuid: "ee7ef219-b101-422c-8ad4-4d5aedf9caad",
    ref: 6,
    customRef: "6",
    structureId: 1,
    nom: "NOUVEAU",
    prenom: "DOSSIER",
    surnom: "TEST",
    sexe: "homme",
    dateNaissance: new Date("1988-11-02T00:00:00.000Z"),
    villeNaissance: "Paris",
    langue: null,
    email: "fake-mail@yopmail.com",
    phone: "0101010101",
    preference: { email: false, phone: false },
    typeDom: "PREMIERE",
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

  it("buildCustomDoc render ", async () => {
    // const docRadie = buildCustomDoc(usagerRadie, structure);
    const docActif: StructureCustomDoc = buildCustomDoc(usagerActif, structure);

    expect(docActif).toEqual(generatedAttestationMock);
  });
});
