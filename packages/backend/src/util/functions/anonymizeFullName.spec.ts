import { anonymizeFullName } from "./anonymizeFullName";

describe("anonymizeFullName", () => {
  describe("Normal cases", () => {
    it("should anonymize normal names correctly", () => {
      const person = { nom: "mamacc", prenom: "Yassine" };
      const result = anonymizeFullName(person);
      expect(result).toBe("Ya****E Ma***C");
    });

    it("should handle mixed case names", () => {
      const person = { nom: "DUPONT", prenom: "jean" };
      const result = anonymizeFullName(person);
      expect(result).toBe("Je*N Du***T");
    });

    it("should handle names with 2 characters or less", () => {
      const person = { nom: "Li", prenom: "Al" };
      const result = anonymizeFullName(person);
      expect(result).toBe("Al Li");
    });

    it("should handle single character names", () => {
      const person = { nom: "X", prenom: "Y" };
      const result = anonymizeFullName(person);
      expect(result).toBe("Y X");
    });

    it("should handle long names", () => {
      const person = { nom: "VeryLongLastName", prenom: "VeryLongFirstName" };
      const result = anonymizeFullName(person);
      expect(result).toBe("Ve**************E Ve*************E");
    });
  });

  describe("Edge cases with whitespace", () => {
    it("should handle names with leading/trailing spaces", () => {
      const person = { nom: "  Dupont  ", prenom: "  Jean  " };
      const result = anonymizeFullName(person);
      expect(result).toBe("Je*N Du***T");
    });

    it("should handle names that are only spaces", () => {
      const person = { nom: "   ", prenom: "  " };
      const result = anonymizeFullName(person);
      expect(result).toBe("");
    });
  });

  describe("Null and undefined cases", () => {
    it("should handle null values", () => {
      const person = { nom: null, prenom: null };
      const result = anonymizeFullName(person);
      expect(result).toBe("");
    });

    it("should handle undefined values", () => {
      const person = { nom: undefined, prenom: undefined };
      const result = anonymizeFullName(person);
      expect(result).toBe("");
    });

    it("should handle mixed null and valid values", () => {
      const person = { nom: "Dupont", prenom: null };
      const result = anonymizeFullName(person);
      expect(result).toBe("Du***T");
    });

    it("should handle mixed undefined and valid values", () => {
      const person = { nom: undefined, prenom: "Jean" };
      const result = anonymizeFullName(person);
      expect(result).toBe("Je*N");
    });
  });

  describe("Empty string cases", () => {
    it("should handle empty strings", () => {
      const person = { nom: "", prenom: "" };
      const result = anonymizeFullName(person);
      expect(result).toBe("");
    });

    it("should handle mixed empty and valid values", () => {
      const person = { nom: "Dupont", prenom: "" };
      const result = anonymizeFullName(person);
      expect(result).toBe("Du***T");
    });

    it("should handle mixed valid and empty values", () => {
      const person = { nom: "", prenom: "Jean" };
      const result = anonymizeFullName(person);
      expect(result).toBe("Je*N");
    });
  });

  describe("Special characters", () => {
    it("should handle names with special characters", () => {
      const person = { nom: "O'Connor", prenom: "Jean-Luc" };
      const result = anonymizeFullName(person);
      expect(result).toBe("Je*****C O'*****R");
    });

    it("should handle names with accents", () => {
      const person = { nom: "Müller", prenom: "François" };
      const result = anonymizeFullName(person);
      expect(result).toBe("Fr*****S Mü***R");
    });
  });
});
