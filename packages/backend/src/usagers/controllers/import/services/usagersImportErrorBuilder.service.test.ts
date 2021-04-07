import { usagersImportErrorBuilder } from "./usagersImportErrorBuilder.service";

describe("usagersImportErrorBuilder parse valid data", () => {
  it("_parseAyantsDroitsKey", async () => {
    expect(
      usagersImportErrorBuilder._parseAyantsDroitsKey("ayantsDroits[0].nom")
    ).toEqual({
      ayantDroitIndex: 0,
      columnNumber: 1 + 33 + 4 * 0 + 0,
      columnAttributeLabel: "Nom",
    });
    expect(
      usagersImportErrorBuilder._parseAyantsDroitsKey("ayantsDroits[3].prenom")
    ).toEqual({
      ayantDroitIndex: 3,
      columnNumber: 1 + 33 + 4 * 3 + 1,
      columnAttributeLabel: "Prénom",
    });
    expect(
      usagersImportErrorBuilder._parseAyantsDroitsKey(
        "ayantsDroits[2].dateNaissance"
      )
    ).toEqual({
      ayantDroitIndex: 2,
      columnNumber: 1 + 33 + 4 * 2 + 2,
      columnAttributeLabel: "Date de naissance",
    });
    expect(
      usagersImportErrorBuilder._parseAyantsDroitsKey(
        "ayantsDroits[2].lienParente"
      )
    ).toEqual({
      ayantDroitIndex: 2,
      columnNumber: 1 + 33 + 4 * 2 + 3,
      columnAttributeLabel: "Lien de Parenté",
    });
  });

  it("buildErrors", async () => {
    expect(
      usagersImportErrorBuilder.buildErrors({
        err: {
          inner: [
            {
              path: "civilite",
              value: "H",
            },
            {
              path: "ayantsDroits[1].prenom",
              value: "Tom",
            },
          ],
        },
        rowNumber: 5,
      })
    ).toEqual([
      {
        columnNumber: 2,
        details: { path: "civilite", value: "H" },
        label: "Civilité",
        rowNumber: 5,
        value: "H",
      },
      {
        columnNumber: 39,
        details: {
          path: "ayantsDroits[1].prenom",
          value: "Tom",
        },
        label: "Prénom Ayant-Droit 2",
        rowNumber: 5,
        value: "Tom",
      },
    ]);
  });
});
