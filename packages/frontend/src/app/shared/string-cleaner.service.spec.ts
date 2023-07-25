import { stringCleaner } from "./string-cleaner.service";

describe("stringCleaner", () => {
  it("stringCleaner.cleanString does not update string if nothing to clean", () => {
    expect(stringCleaner.cleanString("Nothing to clean here")).toEqual(
      "Nothing to clean here"
    );
    expect(stringCleaner.cleanString(null)).toEqual("");
    expect(stringCleaner.cleanString(undefined)).toEqual("");
    expect(stringCleaner.cleanString("undefined")).toEqual("undefined");
  });
  it("stringCleaner.cleanString - clean string", () => {
    expect(
      stringCleaner.cleanString(" Some string       to c#lean ( please, ")
    ).toEqual(" Some string to c#lean ( please, ");

    expect(stringCleaner.cleanString("wwwww<<<>>>>>43(é")).toEqual("wwwww43(é");
  });
});
