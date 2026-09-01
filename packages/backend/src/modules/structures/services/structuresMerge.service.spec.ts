import {
  compareStructureFiles,
  computeMergedCustomRef,
  computeSearchField,
  countDocsWithoutFile,
  docFileKey,
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

describe("files check", () => {
  const B = "domifa/usager-documents/bbbb/";
  const A = "domifa/usager-documents/aaaa/";
  const u1 = "11111111-1111-1111-1111-111111111111";
  const u2 = "22222222-2222-2222-2222-222222222222";
  const u1Clean = u1.replace(/-/g, "");
  const u2Clean = u2.replace(/-/g, "");
  const onB = [
    { key: `${B}${u1Clean}/doc1.pdf.sfe`, size: 10 },
    { key: `${B}${u1Clean}/doc2.pdf.sfe`, size: 20 },
    { key: `${B}${u2Clean}/doc3.pdf.sfe`, size: 30 },
    { key: `${B}deleted/doc4.pdf.sfe`, size: 40 },
  ];

  it("docFileKey follows the upload key layout", () => {
    expect(docFileKey(B, { usagerUUID: u1, path: "doc1.pdf" })).toBe(
      `${B}${u1Clean}/doc1.pdf.sfe`
    );
  });

  it("countDocsWithoutFile counts usager_docs rows with no object", () => {
    expect(
      countDocsWithoutFile(
        B,
        [
          { usagerUUID: u1, path: "doc1.pdf" },
          { usagerUUID: u1, path: "gone.pdf" },
          { usagerUUID: u2, path: "doc3.pdf" },
        ],
        onB
      )
    ).toBe(1);
  });

  it("compareStructureFiles reports present / missing / orphans", () => {
    const onA = [
      { key: `${A}${u1Clean}/doc1.pdf.sfe`, size: 10 },
      { key: `${A}${u1Clean}/doc2.pdf.sfe`, size: 21 },
      { key: `${A}${u2Clean}/doc3.pdf.sfe`, size: 30 },
      { key: `${A}other/doc9.pdf.sfe`, size: 90 },
    ];
    expect(
      compareStructureFiles(B, A, onB, onA, new Set([u1Clean, u2Clean]))
    ).toEqual({
      checked: 3,
      present: 2,
      missing: [`${B}${u1Clean}/doc2.pdf.sfe`],
      orphans: 1,
    });
  });

  it("compareStructureFiles before the merge: nothing at the target yet", () => {
    expect(
      compareStructureFiles(B, A, onB, [], new Set([u1Clean, u2Clean]))
    ).toEqual({
      checked: 3,
      present: 0,
      missing: onB.slice(0, 3).map((o) => o.key),
      orphans: 1,
    });
  });
});
