/* eslint-disable @typescript-eslint/no-explicit-any */
import { isSIRET } from "../isSiret";

describe("isSIRET", () => {
  describe("Valid SIRET numbers", () => {
    it("should validate public establishment SIRET numbers", () => {
      // Commune de Montreuil (Eure-et-Loir)
      expect(isSIRET("21280267200015")).toBe(true);

      // École maternelle des remparts de Montreuil (62)
      expect(isSIRET("21620588000083")).toBe(true);

      // Musée municipal Roger Rodière
      expect(isSIRET("21620588000059")).toBe(true);
    });

    it("should validate CCAS and association SIRET numbers", () => {
      // UDCCAS PARIS
      expect(isSIRET("783 852 791 00087")).toBe(true);

      // Association AURORE Paris
      expect(isSIRET("775 684 970 02786")).toBe(true);
    });

    it("should validate SIRET with formatting characters", () => {
      expect(isSIRET("212 802 672 00015")).toBe(true);
      expect(isSIRET("21-280-267-200-015")).toBe(true);
      expect(isSIRET("212.802.672.00015")).toBe(true);
      expect(isSIRET("212_802_672_00015")).toBe(true);
    });
  });

  describe("Invalid SIRET numbers", () => {
    it("should reject falsy values", () => {
      expect(isSIRET("")).toBe(false);
      expect(isSIRET(null as any)).toBe(false);
      expect(isSIRET(undefined as any)).toBe(false);
    });

    it("should reject non-string types", () => {
      expect(isSIRET(21280267200015 as any)).toBe(false);
      expect(isSIRET({} as any)).toBe(false);
      expect(isSIRET([] as any)).toBe(false);
      expect(isSIRET(true as any)).toBe(false);
    });

    it("should reject incorrect length", () => {
      expect(isSIRET("2128026720001")).toBe(false); // 13 digits
      expect(isSIRET("212802672000151")).toBe(false); // 15 digits
    });

    it("should reject non-numeric characters", () => {
      expect(isSIRET("2128026720001A")).toBe(false);
      expect(isSIRET("abcdefghijklmn")).toBe(false);
      expect(isSIRET("21280267200@15")).toBe(false);
    });

    it("should reject invalid Luhn checksum", () => {
      expect(isSIRET("21280267200014")).toBe(false); // Last digit modified
      expect(isSIRET("00000000000000")).toBe(false); // All zeros
    });
  });

  describe("Formatting and cleanup", () => {
    it("should handle mixed separators and whitespace", () => {
      expect(isSIRET("  212 802 672  00015  ")).toBe(true);
      expect(isSIRET("212-802 672.00015")).toBe(true);
    });
  });
});
