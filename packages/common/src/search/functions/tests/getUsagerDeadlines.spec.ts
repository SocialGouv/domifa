import { Timings } from "../../types";
import { extractDeadlines, getUsagerDeadlines } from "../getUsagerDeadlines";

describe("Check deadlines", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-12-30T22:59:59.999Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  describe("getUsagerDeadlines", () => {
    it("should return all deadlines correctly with a reference date", () => {
      const result = getUsagerDeadlines();

      expect(result).toEqual({
        PREVIOUS_TWO_MONTHS: {
          label: "Depuis plus de 2 mois",
          value: new Date("2024-10-29T22:59:59.999Z"),
        },
        PREVIOUS_THREE_MONTHS: {
          label: "Depuis plus de 3 mois",
          value: new Date("2024-09-29T21:59:59.999Z"), // Attention: changement d'heure !
        },
        PREVIOUS_TWO_YEARS: {
          label: "Depuis plus de 2 ans",
          value: new Date("2022-12-29T22:59:59.999Z"),
        },
        PREVIOUS_YEAR: {
          label: "Depuis plus d'un an",
          value: new Date("2023-12-29T22:59:59.999Z"),
        },
        NEXT_TWO_MONTHS: {
          label: "Dans moins de 2 mois",
          value: new Date("2025-02-28T22:59:59.999Z"),
        },
        NEXT_TWO_WEEKS: {
          label: "Dans moins de 2 semaines",
          value: new Date("2025-01-13T22:59:59.999Z"),
        },
        EXCEEDED: {
          label: "Échéance dépassée",
          value: new Date("2024-12-30T22:59:59.999Z"),
        },
      });
    });

    it("should use current date when no reference date is provided", () => {
      const result = getUsagerDeadlines();
      expect(result.EXCEEDED.value).toEqual(
        new Date("2024-12-30T22:59:59.999Z")
      );
    });
  });

  describe("extractDeadlines", () => {
    it("should extract specified deadlines correctly", () => {
      const keys: Timings[] = ["PREVIOUS_TWO_MONTHS", "NEXT_TWO_WEEKS"];
      const result = extractDeadlines(keys);

      expect(result).toEqual({
        PREVIOUS_TWO_MONTHS: {
          label: "Depuis plus de 2 mois",
          value: new Date("2024-10-29T22:59:59.999Z"),
        },
        NEXT_TWO_WEEKS: {
          label: "Dans moins de 2 semaines",
          value: new Date("2025-01-13T22:59:59.999Z"),
        },
      });
    });

    it("should return empty object when no keys provided", () => {
      const result = extractDeadlines([], new Date("2024-01-15T22:59:59.999Z"));
      expect(result).toEqual({});
    });

    it("should use current date when no reference date provided", () => {
      const keys: Timings[] = ["EXCEEDED"];
      const result = extractDeadlines(keys);

      expect(result.EXCEEDED.value).toEqual(
        new Date("2024-12-30T22:59:59.999Z")
      );
    });

    it("should extract multiple deadlines correctly", () => {
      const keys: Timings[] = ["PREVIOUS_TWO_MONTHS", "NEXT_TWO_MONTHS"];
      const result = extractDeadlines(keys);

      expect(result).toEqual({
        PREVIOUS_TWO_MONTHS: {
          label: "Depuis plus de 2 mois",
          value: new Date("2024-10-29T22:59:59.999Z"),
        },
        NEXT_TWO_MONTHS: {
          label: "Dans moins de 2 mois",
          value: new Date("2025-02-28T22:59:59.999Z"),
        },
      });
    });
  });
});
