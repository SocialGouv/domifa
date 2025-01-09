import { Telephone } from "../../../_common/model";
import { formatInternationalPhoneNumber } from "./formatInternationalPhoneNumber";

describe("formatInternationalPhoneNumber", () => {
  describe("Numéros français (plage de numéros utilisés dans le Cinéma)", () => {
    test.each([
      // 06 98 XX XX XX - mobiles fictifs
      {
        input: { numero: "0698001122", countryCode: "FR" },
        expected: "06 98 00 11 22",
      },
      {
        input: { numero: "0698999999", countryCode: "FR" },
        expected: "06 98 99 99 99",
      },
      // 01 99 XX XX XX - fixes fictifs
      {
        input: { numero: "0199001122", countryCode: "FR" },
        expected: "01 99 00 11 22",
      },
      {
        input: { numero: "0199999999", countryCode: "FR" },
        expected: "01 99 99 99 99",
      },
    ])(
      "devrait formater correctement le numéro fictif $input.numero",
      ({ input, expected }) => {
        expect(formatInternationalPhoneNumber(input as Telephone)).toBe(
          expected
        );
      }
    );
  });

  // Tests numéros espagnols (focus sur mobiles)
  describe("Numéros espagnols", () => {
    test.each([
      // Mobiles espagnols (commencent par 6 ou 7)
      {
        input: { numero: "612345678", countryCode: "ES" },
        expected: "+34 612 34 56 78",
      },
      {
        input: { numero: "712345678", countryCode: "ES" },
        expected: "+34 712 34 56 78",
      },
      // Format avec préfixe international
      {
        input: { numero: "+34612345678", countryCode: "ES" },
        expected: "+34 612 34 56 78",
      },
    ])(
      "devrait formater correctement le mobile espagnol $input.numero",
      ({ input, expected }) => {
        expect(formatInternationalPhoneNumber(input as Telephone)).toBe(
          expected
        );
      }
    );
  });

  // Tests numéros bangladais (focus sur mobiles)
  describe("Numéros bangladais", () => {
    test.each([
      // Mobiles bangladais (commencent par 01)
      {
        input: { numero: "01712345678", countryCode: "BD" },
        expected: "+880 1712-345678",
      },
      {
        input: { numero: "01812345678", countryCode: "BD" },
        expected: "+880 1812-345678",
      },
      // Format avec préfixe international
      {
        input: { numero: "+8801712345678", countryCode: "BD" },
        expected: "+880 1712-345678",
      },
    ])(
      "devrait formater correctement le mobile bangladais $input.numero",
      ({ input, expected }) => {
        expect(formatInternationalPhoneNumber(input as Telephone)).toBe(
          expected
        );
      }
    );
  });

  // Tests des cas d'erreur
  describe("Cas d'erreur", () => {
    test.each([
      {
        input: { numero: "", countryCode: "FR" },
        expected: null,
        description: "numéro vide",
      },
      {
        input: { numero: null, countryCode: "FR" },
        expected: null,
        description: "numéro null",
      },
      {
        input: { numero: "0612345678", countryCode: null },
        expected: null,
        description: "countryCode null",
      },
      {
        input: { numero: "abcdefghij", countryCode: "FR" },
        expected: null,
        description: "numéro invalide",
      },
      {
        input: { numero: "0612345678", countryCode: "XX" },
        expected: null,
        description: "pays invalide",
      },
    ])(
      'devrait retourner "$expected" pour $description',
      ({ input, expected }) => {
        expect(formatInternationalPhoneNumber(input as Telephone)).toBe(
          expected
        );
      }
    );
  });
});
