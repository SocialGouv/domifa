import { UsagersImportUsager } from "../schema-generated-model";
import { UsagersImportUsagerSchema } from "./UsagersImportUsagerSchema.joi";

const params = {
  today: new Date(Date.UTC(2020, 0, 1)),
};

describe("UsagersImportCiviliteSchema schema", () => {
  it("valid usager", async () => {
    expect(
      await UsagersImportUsagerSchema.validateAsync({
        params,
        data: {
          civilite: "H",
          dateNaissance: "15/06/2018",
          nom: "Dupont",
          prenom: "Paul",
        },
      })
    ).toEqual<UsagersImportUsager>({
      params,
      data: {
        civilite: "h",
        dateNaissance: (new Date(
          Date.UTC(2018, 6 - 1, 15)
        ) as unknown) as string, // type string généré au lieu de Date car custom validation
        nom: "Dupont",
        prenom: "Paul",
      },
    });
  });

  it("invalid values", async () => {
    try {
      const res = await UsagersImportUsagerSchema.validateAsync(
        {
          params,
          data: {
            civilite: "x", // invalid value
            dateNaissance: "15/06/2028", // future date
            nom: undefined, // missing required
            prenom: "Paul",
          },
        },
        {
          abortEarly: false,
        }
      );
      fail(`Invalid values should throw an exception, but returned "${res}"`);
    } catch (err) {
      //joi.dev/api/?v=17.4.0#errors
      expect(err.details).toBeDefined();
      // if (err.details.length !== 2) {
      console.log(err.details);
      // }
      expect(err.details.length).toEqual(2);
      expect(err.details[0].context.key).toEqual("civilite");
      expect(err.details[1].context.key).toEqual("dateNaissance");
    }
  });
});
