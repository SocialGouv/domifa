import { TEST_VALID_IMPORT_USAGER } from "./test-data";
import { UsagersImportUsagerSchema } from "./UsagersImportUsagerSchema.yup";
import { UsagersImportUsagerSchemaContext } from "./UsagersImportUsagerSchemaContext.type";

const today = new Date(Date.UTC(2021, 0, 1));
const nextYear = new Date(Date.UTC(2022, 0, 1));
const minDate = new Date(Date.UTC(1900, 0, 1));

const context: UsagersImportUsagerSchemaContext = {
  today,
  nextYear,
  minDate,
  countryCode: "fr",
};

describe("UsagersImportCiviliteSchema invalid schema", () => {
  it("valid usager", async () => {
    try {
      await UsagersImportUsagerSchema.validate(
        {
          ...TEST_VALID_IMPORT_USAGER,
          civilite: "y",
          dateNaissance: "15/06/2050",
          email: "test@yop",
          statutDom: "invalid-statutDom",
          typeDom: "invalid-typeDom",
          dateDebutDom: "2019",
          datePremiereDom: "10/03-250",
          dateDernierPassage: "18/12",
          orientation: "invalid-orientation",
          domiciliationExistante: "NO",
          revenus: "yes",
          typeMenage: "invalid-typeMenage",
          residence: "invalid-residence",
          causeInstabilite: "invalid-causeInstabilite",
          raisonDemande: "invalid-raisonDemande",
          accompagnement: "n",
        },
        { context, abortEarly: false }
      );
      fail("UsagersImportUsagerSchema.validate should have thrown an error");
    } catch (err: any) {
      const errors = err?.inner ?? [];
      const errorsPaths = errors.map((x) => x.path);
      expect(errorsPaths).toEqual([
        "civilite",
        "dateNaissance",
        "email",
        "email",
        "statutDom",
        "typeDom",
        "dateDebutDom",
        "datePremiereDom",
        "dateDernierPassage",
        "orientation",
        "domiciliationExistante",
        "revenus",
        "typeMenage",
        "residence",
        "causeInstabilite",
        "raisonDemande",
        "accompagnement",
      ]);
    }
  });
});
