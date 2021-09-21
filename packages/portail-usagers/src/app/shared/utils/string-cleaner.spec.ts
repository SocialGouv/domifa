import { cleanString } from "./string-cleaner";

describe("stringCleaner", () => {
  it("stringCleaner.cleanString does not update string if nothing to clean", () => {
    expect(cleanString("Nothing to clean here")).toEqual(
      "Nothing to clean here"
    );
    expect(cleanString("undefined")).toEqual("undefined");
  });
  it("stringCleaner.cleanString - clean string", () => {
    expect(cleanString(" Some string       to c#lean ( please, ")).toEqual(
      "Some string to clean please"
    );
  });
});
