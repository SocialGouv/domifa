import { TEST_VALID_IMPORT_ROW } from "./schema/test-data";
import { UsagersImportUsager } from "./schema/UsagersImportUsagerSchema.yup";
import { UsagersImportUsagerSchemaContext } from "./schema/UsagersImportUsagerSchemaContext.type";
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

describe("usagersImportValidator parse valid data", () => {
  it("valid usager", async () => {
    const { usagerRow, errors } = await usagersImportValidator.parseAndValidate(
      {
        row: TEST_VALID_IMPORT_ROW,
        context,
        rowNumber: 10,
      }
    );
    expect(errors).toEqual([]);
    expect(usagerRow).toEqual<Partial<UsagersImportUsager>>({
      customRef: "15b",
      civilite: "H",
      nom: "Dupont",
      prenom: "Paul",
      surnom: "Polo",
      dateNaissance: new Date(Date.UTC(2000, 6 - 1, 15)),
      lieuNaissance: "Paris",
      telephone: {
        countryCode: "fr",
        numero: "06 02 03 04 05",
      },
      email: "paul.dupont.168436@gmail.com",
      statutDom: "VALIDE",
      // motifRefus: undefined,
      // motifRadiation: undefined,
      typeDom: "PREMIERE_DOM",
      dateDebutDom: new Date(Date.UTC(2019, 3 - 1, 10)),
      dateFinDom: new Date(Date.UTC(2020, 3 - 1, 10)),
      datePremiereDom: new Date(Date.UTC(2019, 3 - 1, 10)),
      dateDernierPassage: new Date(Date.UTC(2020, 12 - 1, 18)),
      orientation: false,
      orientationDetail: "détails orientation",
      domiciliationExistante: false,
      revenus: true,
      revenusDetail: "détails revenus",
      liencommune: "SOCIAL",
      liencommuneDetail: "suivi social",
      typeMenage: "FEMME_ISOLE_AVEC_ENFANT",
      situationResidentielle: "HEBERGEMENT_TIERS",
      situationDetails: "détails situation",
      causeInstabilite: "ERRANCE",
      causeDetail: "détails cause",
      raisonDemande: "EXERCICE_DROITS",
      raisonDemandeDetail: "détails raison demande",
      accompagnement: false,
      accompagnementDetail: "détails accompagnement",
      commentaires: "commentaires sur l'usager",
      ayantsDroits: [
        {
          nom: "Dupont",
          prenom: "Paula",
          dateNaissance: new Date(Date.UTC(2018, 7 - 1, 15)),
          lienParente: "ENFANT",
        },
        {
          nom: "Dupont",
          prenom: "John",
          dateNaissance: new Date(Date.UTC(1938, 7 - 1, 15)),
          lienParente: "PARENT",
        },
      ],
    });
  });
});
