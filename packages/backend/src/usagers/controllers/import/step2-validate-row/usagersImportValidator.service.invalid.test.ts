import moment = require("moment");
import { UsagersImportUsagerSchemaContext } from "./schema";
import { usagersImportValidator } from "./usagersImportValidator.service";

const today = new Date(Date.UTC(2021, 0, 1));
const nextYear = new Date(Date.UTC(2022, 0, 1));
const minDate = new Date(Date.UTC(1900, 0, 1));

const context: UsagersImportUsagerSchemaContext = {
  today,
  nextYear,
  minDate,
  countryCode: "fr",
};

const rowNumber = 10;

describe("usagersImportValidator parse invalid data", () => {
  it("invalid usager", async () => {
    const { usagerRow, errors } = await usagersImportValidator.parseAndValidate(
      {
        row: [
          // @see USAGERS_IMPORT_COLUMNS
          "15b", // customRef
          "y", // civilite
          "Dupont", // nom
          "Paul", // prenom
          "Polo", // surnom
          "15/06/2050", // dateNaissance
          "Paris", // lieuNaissance
          "0102030405 et des lettres", // phone
          "paul.dupont.168436[AT]gmail.com", // email
          "invalid-statutDom", // statutDom
          undefined, // motifRefus
          undefined, // motifRadiation
          "PREMIERE", // typeDom
          "10/03/2020", // dateDebutDom
          "10/03/2020", // dateFinDom
          "10/03/2050", // datePremiereDom
          "18/12/2040", // dateDernierPassage
          "invalid-orientation", // orientation
          "détails orientation", // orientationDetail
          "NO", // domiciliationExistante
          "yes", // revenus
          "détails revenus", // revenusDetail
          "SOCIAL", // liencommune
          "suivi social", // liencommune
          "invalid-typeMenage", // typeMenage
          "invalid-situationResidentielle", // situationResidentielle
          "détails situation", // situationDetails
          "invalid-causeInstabilite", // causeInstabilite
          "détails cause", // causeDetail
          "invalid-raisonDemande", // raisonDemande
          "détails raison demande", // raisonDemandeDetail
          "n", // accompagnement
          "détails accompagnement", // accompagnementDetail
          "commentaires sur l'usager", // commentaires
          "Dupont", // AYANT_DROIT N°1 - nom
          undefined, // AYANT_DROIT N°1 - prenom
          "15/07/2218", // AYANT_DROIT N°1 - dateNaissance
          "ENFANT", // AYANT_DROIT N°1 - lienParente
          "Dupont", // AYANT_DROIT N°2 - nom
          "John", // AYANT_DROIT N°2 - prenom
          "15/07/1938", // AYANT_DROIT N°2 - dateNaissance
          "invalid-lienParente", // AYANT_DROIT N°2 - lienParente
        ],
        context,
        rowNumber,
      }
    );
    expect(usagerRow).toBeUndefined();
    expect(
      errors.map(({ rowNumber, columnNumber, value, label }) => ({
        rowNumber,
        columnNumber,
        value,
        label,
      }))
    ).toEqual([
      { columnNumber: 2, label: "Civilité", rowNumber: 10, value: "y" },
      {
        columnNumber: 6,
        label: "Date naissance",
        rowNumber: 10,
        value: "15/06/2050",
      },
      {
        columnNumber: 8,
        label: "Téléphone",
        rowNumber: 10,
        value: {
          countryCode: "fr",
          numero: "0102030405 et des lettres",
        },
      },

      {
        columnNumber: 9,
        label: "Email",
        rowNumber: 10,
        value: "paul.dupont.168436[AT]gmail.com",
      },
      {
        columnNumber: 10,
        label: "Statut domiciliation",
        rowNumber: 10,
        value: "invalid-statutDom",
      },
      {
        columnNumber: 16,
        label: "Date 1ere domiciliation",
        rowNumber: 10,
        value: "10/03/2050",
      },
      {
        columnNumber: 17,
        label: "Date de dernier passage",
        rowNumber: 10,
        value: moment(new Date(Date.UTC(2040, 12 - 1, 18))).format(
          "DD/MM/yyyy"
        ),
      },
      {
        columnNumber: 18,
        label: "Orientation",
        rowNumber: 10,
        value: "invalid-orientation",
      },
      {
        columnNumber: 20,
        label: "La personne a t-elle déjà une domiciliation ?",
        rowNumber: 10,
        value: "NO",
      },
      {
        columnNumber: 21,
        label: "Le domicilié possède t-il des revenus ?",
        rowNumber: 10,
        value: "yes",
      },
      {
        columnNumber: 25,
        label: "Composition du ménage",
        rowNumber: 10,
        value: "invalid-typeMenage",
      },
      {
        columnNumber: 26,
        label: "Situation résidentielle",
        rowNumber: 10,
        value: "invalid-situationResidentielle",
      },
      {
        columnNumber: 28,
        label: "Cause instabilité logement",
        rowNumber: 10,
        value: "invalid-causeInstabilite",
      },
      {
        columnNumber: 30,
        label: "Motif principal de la demande",
        rowNumber: 10,
        value: "invalid-raisonDemande",
      },
      {
        columnNumber: 32,
        label: "Accompagnement social",
        rowNumber: 10,
        value: "n",
      },
      {
        columnNumber: 36,
        label: "Prénom Ayant-Droit 1",
        rowNumber: 10,
        value: undefined,
      },
      {
        columnNumber: 37,
        label: "Date de naissance Ayant-Droit 1",
        rowNumber: 10,
        value: moment(new Date(Date.UTC(2218, 7 - 1, 15))).format("DD/MM/yyyy"),
      },
      {
        columnNumber: 42,
        label: "Lien de Parenté Ayant-Droit 2",
        rowNumber: 10,
        value: "invalid-lienParente",
      },
    ]);
  });
});
