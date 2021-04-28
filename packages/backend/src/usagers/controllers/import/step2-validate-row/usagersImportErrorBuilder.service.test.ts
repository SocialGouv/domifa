import {
  TEST_INVALID_IMPORT_USAGER,
  TEST_VALID_IMPORT_USAGER,
} from "./schema/test-data";
import { usagersImportErrorBuilder } from "./usagersImportErrorBuilder.service";

describe("usagersImportErrorBuilder parse valid data", () => {
  it("_parseAyantsDroitsKey", async () => {
    expect(
      usagersImportErrorBuilder._parseAyantsDroitsKey("ayantsDroits[0].nom")
    ).toEqual({
      ayantDroitIndex: 0,
      columnNumber: 1 + 33 + 4 * 0 + 0,
      columnAttributeLabel: "Nom",
      attributeKey: "nom",
    });
    expect(
      usagersImportErrorBuilder._parseAyantsDroitsKey("ayantsDroits[3].prenom")
    ).toEqual({
      ayantDroitIndex: 3,
      columnNumber: 1 + 33 + 4 * 3 + 1,
      columnAttributeLabel: "Prénom",
      attributeKey: "prenom",
    });
    expect(
      usagersImportErrorBuilder._parseAyantsDroitsKey(
        "ayantsDroits[2].dateNaissance"
      )
    ).toEqual({
      ayantDroitIndex: 2,
      columnNumber: 1 + 33 + 4 * 2 + 2,
      columnAttributeLabel: "Date de naissance",
      attributeKey: "dateNaissance",
    });
    expect(
      usagersImportErrorBuilder._parseAyantsDroitsKey(
        "ayantsDroits[2].lienParente"
      )
    ).toEqual({
      ayantDroitIndex: 2,
      columnNumber: 1 + 33 + 4 * 2 + 3,
      columnAttributeLabel: "Lien de Parenté",
      attributeKey: "lienParente",
    });
  });

  it("buildErrors", async () => {
    expect(
      usagersImportErrorBuilder.buildErrors({
        err: {
          inner: [
            {
              path: "civilite",
              value: "homme",
            },
            {
              path: "ayantsDroits[1].prenom",
              value: "",
            },
          ],
        },
        rowNumber: 5,
        rowAsObject: TEST_INVALID_IMPORT_USAGER,
      })
    ).toEqual([
      {
        columnNumber: 2,
        details: { path: "civilite", value: "homme" },
        label: "Civilité",
        rowNumber: 5,
        value: "homme",
      },
      {
        columnNumber: 39,
        details: {
          path: "ayantsDroits[1].prenom",
          value: "",
        },
        label: "Prénom Ayant-Droit 2",
        rowNumber: 5,
        value: "",
      },
    ]);
  });
});
