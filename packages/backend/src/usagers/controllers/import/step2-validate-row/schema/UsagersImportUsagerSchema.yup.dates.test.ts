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
};

describe("UsagersImportCiviliteSchema dates", () => {
  it("statutDom=REFUS dateDebutDom+dateFinDom", async () => {
    const usager = await UsagersImportUsagerSchema.validate(
      {
        ...TEST_VALID_IMPORT_USAGER,
        statutDom: "REFUS",
        dateDebutDom: "03/02/2020",
        dateFinDom: "05/10/2020",
      },
      { context }
    );

    expect(usager.statutDom).toEqual("REFUS");
    expect(usager.dateDebutDom).toEqual(new Date(Date.UTC(2020, 2 - 1, 3)));
    expect(usager.dateFinDom).toEqual(new Date(Date.UTC(2020, 10 - 1, 5)));
  });
  it("statutDom=REFUS dateDebutDom missing", async () => {
    await expect(
      UsagersImportUsagerSchema.validate(
        {
          ...TEST_VALID_IMPORT_USAGER,
          statutDom: "REFUS",
          dateDebutDom: null, // missing
          dateFinDom: "05/10/2021",
        },
        { context }
      )
    ).rejects.toThrowError(
      "dateDebutDom must be a `date` type, but the final value was: `Invalid Date`."
    );
  });

  it("statutDom=REFUS dateFinDom > nextYear", async () => {
    await expect(
      UsagersImportUsagerSchema.validate(
        {
          ...TEST_VALID_IMPORT_USAGER,
          statutDom: "REFUS",
          dateDebutDom: "05/01/2020",
          dateFinDom: "05/10/2022", // > Today
        },
        { context }
      )
    ).rejects.toThrowError(
      "dateFinDom field must be at earlier than 2022-01-01T00:00:00.000Z"
    );
  });

  it("statutDom=REFUS dateDebutDom < minDate", async () => {
    await expect(
      UsagersImportUsagerSchema.validate(
        {
          ...TEST_VALID_IMPORT_USAGER,
          statutDom: "REFUS",
          dateDebutDom: "05/01/1850", // < minDate
          dateFinDom: "05/10/2020",
        },
        { context }
      )
    ).rejects.toThrowError(
      "dateDebutDom field must be later than 1900-01-01T00:00:00.000Z"
    );
  });

  it("statutDom=VALIDE dateDebutDom missing", async () => {
    await expect(
      UsagersImportUsagerSchema.validate(
        {
          ...TEST_VALID_IMPORT_USAGER,
          statutDom: "VALIDE",
          dateDebutDom: null, // missing
          dateFinDom: "05/10/2021",
        },
        { context }
      )
    ).rejects.toThrowError(
      "dateDebutDom must be a `date` type, but the final value was: `Invalid Date`."
    );
  });

  it("statutDom=VALIDE dateFinDom missing", async () => {
    await expect(
      UsagersImportUsagerSchema.validate(
        {
          ...TEST_VALID_IMPORT_USAGER,
          statutDom: "valide", // will be uppercased to 'VALIDE'
          dateDebutDom: "03/02/2020",
          dateFinDom: null, // missing
        },
        { context }
      )
    ).rejects.toThrowError(
      "dateFinDom must be a `date` type, but the final value was: `Invalid Date`."
    );
  });

  it("statutDom=VALIDE dateDebutDom > dateFinDom", async () => {
    await expect(
      UsagersImportUsagerSchema.validate(
        {
          ...TEST_VALID_IMPORT_USAGER,
          statutDom: "VALIDE",
          dateDebutDom: "03/02/2022",
          dateFinDom: "05/10/2021",
        },
        { context }
      )
    ).rejects.toThrowError(
      "dateFinDom field must be later than 2022-02-03T00:00:00.000Z"
    );
  });
});
