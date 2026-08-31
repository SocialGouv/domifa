import {
  computeMergedCustomRef,
  computeSearchField,
} from "./structuresMerge.service";

describe("computeMergedCustomRef", () => {
  const custom = { ref: 3, customRef: "DOSSIER-3" };
  const byDefault = { ref: 3, customRef: "3" };

  it("auto keeps a customised ref and renumbers a default one", () => {
    expect(computeMergedCustomRef(custom, 103, { type: "auto" })).toBe(
      "DOSSIER-3"
    );
    expect(computeMergedCustomRef(byDefault, 103, { type: "auto" })).toBe(
      "103"
    );
    expect(
      computeMergedCustomRef({ ref: 3, customRef: null }, 103, { type: "auto" })
    ).toBe("103");
  });

  it("applies keep / new-ref / prefix / suffix", () => {
    expect(computeMergedCustomRef(custom, 103, { type: "keep" })).toBe(
      "DOSSIER-3"
    );
    expect(computeMergedCustomRef(custom, 103, { type: "new-ref" })).toBe(
      "103"
    );
    expect(
      computeMergedCustomRef(byDefault, 103, { type: "prefix", value: "B-" })
    ).toBe("B-3");
    expect(
      computeMergedCustomRef(custom, 103, { type: "suffix", value: "-B" })
    ).toBe("DOSSIER-3-B");
  });
});

describe("computeSearchField", () => {
  it("matches the UsagerSubscriber formula", () => {
    expect(
      computeSearchField(
        { nom: " Dupont ", prenom: "Émile", surnom: null },
        103,
        "DOSSIER-3"
      )
    ).toBe("dupont emile dossier 3");
    expect(
      computeSearchField(
        { nom: "Dupont", prenom: "Émile", surnom: "Mimile" },
        103,
        null
      )
    ).toBe("dupont emile mimile 103");
  });
});
