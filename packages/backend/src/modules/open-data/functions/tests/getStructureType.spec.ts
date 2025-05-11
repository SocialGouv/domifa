import { getStructureType } from "../getStructureType";
import { STRUCTURE_NAMES } from "./STRUCTURE_NAMES.const";

describe("checkOrganizationType", () => {
  it("should correctly identify organization types for all entries", () => {
    Object.entries(STRUCTURE_NAMES).forEach(([name, expectedType]) => {
      const result = getStructureType(name);
      expect(result).toBe(expectedType);
    });
  });

  it("should return an empty string for unrecognized inputs", () => {
    const unrecognizedInputs = [
      "Random Organization",
      "Just a regular company",
    ];

    unrecognizedInputs.forEach((input) => {
      expect(getStructureType(input)).toBe("asso");
    });
  });

  it("should handle edge cases correctly", () => {
    const edgeCases = {
      "": null,
      " ": null,
      CCAS: "ccas",
      cias: "cias",
      Association: "asso",
      "<script>CCAS</script>": "ccas",
      "C.C.A.S.": "ccas",
      "Centre   Communal    d'Action    Sociale": "ccas",
      "MAIRIE-CCAS": "ccas",
      "Organisme-Association": "asso",
    };

    Object.entries(edgeCases).forEach(([input, expected]) => {
      expect(getStructureType(input)).toBe(expected);
    });
  });
});
