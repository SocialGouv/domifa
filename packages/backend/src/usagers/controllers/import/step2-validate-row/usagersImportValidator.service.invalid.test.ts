import { UsagersImportUsagerSchemaContext } from "./schema";
import { usagersImportValidator } from "./usagersImportValidator.service";

const today = new Date(Date.UTC(2021, 0, 1));
const nextYear = new Date(Date.UTC(2022, 0, 1));
const minDate = new Date(Date.UTC(1900, 0, 1));

const context: UsagersImportUsagerSchemaContext = {
  today,
  nextYear,
  minDate,
};

const rowNumber = 10;

describe("usagersImportValidator parse invalid data", () => {
  it("invalid usager", async () => {
    const { usagerRow, errors } = await usagersImportValidator.parseAndValidate(
      {
        row: [
          // @see USAGERS_IMPORT_COLUMNS
          "15b", // customId
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
          "détails orientation", // orientationDetails
          "NO", // domiciliationExistante
          "yes", // revenus
          "détails revenus", // revenusDetails
          "suivi social", // lienCommune
          "invalid-compositionMenage", // compositionMenage
          "invalid-situationResidentielle", // situationResidentielle
          "détails situation", // situationDetails
          "invalid-causeInstabilite", // causeInstabilite
          "détails cause", // causeDetails
          "invalid-raisonDemande", // raisonDemande
          "détails raison demande", // raisonDemande_details
          "n", // accompagnement
          "détails accompagnement", // accompagnementDetails
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
      { columnNumber: 2, label: "Civilité", rowNumber: 10, value: "Y" },
      {
        columnNumber: 6,
        label: "Date naissance",
        rowNumber: 10,
        value: new Date(Date.UTC(2050, 6 - 1, 15)),
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
        value: "INVALID-STATUTDOM",
      },
      {
        columnNumber: 16,
        label: "Date 1ere domiciliation",
        rowNumber: 10,
        value: new Date(Date.UTC(2050, 3 - 1, 10)),
      },
      {
        columnNumber: 17,
        label: "Date de dernier passage",
        rowNumber: 10,
        value: new Date(Date.UTC(2040, 12 - 1, 18)),
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
        columnNumber: 24,
        label: "Composition du ménage",
        rowNumber: 10,
        value: "INVALID-COMPOSITIONMENAGE",
      },
      {
        columnNumber: 25,
        label: "Situation résidentielle",
        rowNumber: 10,
        value: "INVALID-SITUATIONRESIDENTIELLE",
      },
      {
        columnNumber: 27,
        label: "Cause instabilité logement",
        rowNumber: 10,
        value: "INVALID-CAUSEINSTABILITE",
      },
      {
        columnNumber: 29,
        label: "Motif principal de la demande",
        rowNumber: 10,
        value: "INVALID-RAISONDEMANDE",
      },
      {
        columnNumber: 31,
        label: "Accompagnement social",
        rowNumber: 10,
        value: "n",
      },
      {
        columnNumber: 35,
        label: "Prénom Ayant-Droit 1",
        rowNumber: 10,
        value: undefined,
      },
      {
        columnNumber: 36,
        label: "Date de naissance Ayant-Droit 1",
        rowNumber: 10,
        value: new Date(Date.UTC(2218, 7 - 1, 15)),
      },
      {
        columnNumber: 41,
        label: "Lien de Parenté Ayant-Droit 2",
        rowNumber: 10,
        value: "INVALID-LIENPARENTE",
      },
    ]);
  });
});
