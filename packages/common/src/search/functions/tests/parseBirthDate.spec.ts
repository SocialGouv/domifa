import { parseBirthDate } from "../parseBirthDate";

describe("parseBirthDate", () => {
  describe("Valid Date Formats", () => {
    it("should parse a valid date", () => {
      const result = parseBirthDate("15/08/1990");
      expect(result).toBe("15081990");
    });

    it("should handle initial zeros", () => {
      const result = parseBirthDate("01/02/2000");
      expect(result).toBe("01022000");
    });
  });

  describe("Date Range Validation: 1900 < date > now", () => {
    it("should return null for a date before 1900", () => {
      const result = parseBirthDate("01/01/1899");
      expect(result).toBeNull();
    });

    it("should return null for a future date", () => {
      const result = parseBirthDate("01/01/2045");
      expect(result).toBeNull();
    });
  });

  describe("Invalid Date Formats", () => {
    it("should return null for incorrect date format", () => {
      const result = parseBirthDate("2023-01-15");
      expect(result).toBeNull();
    });

    it("should return null for a non-existent date", () => {
      const result = parseBirthDate("31/02/2000");
      expect(result).toBeNull();
    });

    it("should return null for a non-numeric string", () => {
      const result = parseBirthDate("abc/def/ghij");
      expect(result).toBeNull();
    });
  });

  // Spaces handling tests
  describe("Spaces Handling", () => {
    it("should remove spaces before and after the date", () => {
      const result = parseBirthDate("  15/08/1990  ");
      expect(result).toBe("15081990");
    });
  });

  // Boundary cases tests
  describe("Boundary Cases", () => {
    it("should accept the minimum allowed date", () => {
      const result = parseBirthDate("01/01/1900");
      expect(result).toBe("01011900");
    });

    it("should accept the maximum allowed date (today)", () => {
      const today = new Date();
      const formattedToday = `${today.getDate().toString().padStart(2, "0")}/${(
        today.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${today.getFullYear()}`;
      const result = parseBirthDate(formattedToday);
      expect(result).not.toBeNull();
    });
  });
});
