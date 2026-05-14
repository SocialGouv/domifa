// Mock the data source BEFORE importing the helper. We replicate the actual
// PostgresDriver.escape behavior so the test exercises the same string-level
// quoting logic that runs in production, without booting a real DB.
jest.mock("./appTypeormManager.service", () => ({
  myDataSource: {
    driver: {
      escape: (name: string): string => `"${name.replace(/"/g, '""')}"`,
    },
  },
}));

import { joinSelectFields } from "./sql-identifier.helper";

describe("joinSelectFields", () => {
  describe("basic shape", () => {
    it("returns an empty array for an empty input", () => {
      expect(joinSelectFields([])).toEqual([]);
    });

    it("preserves the order of fields", () => {
      const out = joinSelectFields(["a", "b", "c"]);
      expect(out).toEqual([`"a"`, `"b"`, `"c"`]);
    });

    it("returns an array of the same length as input", () => {
      const out = joinSelectFields(["x", "y", "z", "w"]);
      expect(out).toHaveLength(4);
    });
  });

  describe("legitimate identifiers", () => {
    it("quotes lowercase identifiers", () => {
      expect(joinSelectFields(["nom", "prenom"])).toEqual([
        `"nom"`,
        `"prenom"`,
      ]);
    });

    it("quotes camelCase identifiers (case preserved)", () => {
      expect(joinSelectFields(["createdAt", "userUuid"])).toEqual([
        `"createdAt"`,
        `"userUuid"`,
      ]);
    });

    it("quotes identifiers containing digits and underscores", () => {
      expect(joinSelectFields(["col_1", "col2", "_internal"])).toEqual([
        `"col_1"`,
        `"col2"`,
        `"_internal"`,
      ]);
    });
  });

  describe("identifier injection defense", () => {
    it("doubles a single embedded quote", () => {
      expect(joinSelectFields([`weird"col`])).toEqual([`"weird""col"`]);
    });

    it("doubles every embedded quote in a multi-quote identifier", () => {
      expect(joinSelectFields([`"a"b"`])).toEqual([`"""a""b"""`]);
    });

    it("neutralizes a SQL injection payload trying to break out", () => {
      // Classic identifier-breakout attempt. The escape turns it into a
      // syntactically valid (but inert) Postgres identifier — the embedded
      // double-quotes are doubled, so the closing quote stays where we put it.
      const payload = `"; DROP TABLE users; --`;
      const escaped = joinSelectFields([payload])[0];

      expect(escaped.startsWith(`"`)).toBe(true);
      expect(escaped.endsWith(`"`)).toBe(true);
      // Every internal `"` MUST be doubled — otherwise we'd have an unbalanced
      // quote that breaks out of the identifier.
      const inner = escaped.slice(1, -1);
      const innerQuotes = (inner.match(/"/g) ?? []).length;
      expect(innerQuotes % 2).toBe(0);
    });

    it("never produces an output with an odd number of internal quotes", () => {
      // Property-style check: for any input, the inner section between the
      // outer quotes must have an even count of `"` chars (each original `"`
      // got doubled). An odd count would mean a break-out is possible.
      const inputs = [
        `simple`,
        `a"b`,
        `""""`,
        `"; SELECT 1 --`,
        `nom`,
        ``,
        `\\"; DELETE FROM x;`,
      ];

      for (const input of inputs) {
        const out = joinSelectFields([input])[0];
        expect(out.startsWith(`"`)).toBe(true);
        expect(out.endsWith(`"`)).toBe(true);
        const inner = out.slice(1, -1);
        const internalQuotes = (inner.match(/"/g) ?? []).length;
        expect(internalQuotes % 2).toBe(0);
      }
    });

    it("does not interpret backslashes or semicolons specially", () => {
      // The escape function only deals with `"`. Other chars pass through —
      // they're harmless because they're inside a quoted identifier.
      const escaped = joinSelectFields([`foo\\;DROP`])[0];
      expect(escaped).toBe(`"foo\\;DROP"`);
    });
  });

  describe("edge cases", () => {
    it("handles an empty-string identifier (still quoted)", () => {
      expect(joinSelectFields([""])).toEqual([`""`]);
    });

    it("handles unicode identifiers without throwing", () => {
      expect(joinSelectFields(["nœud", "été"])).toEqual([`"nœud"`, `"été"`]);
    });
  });
});
