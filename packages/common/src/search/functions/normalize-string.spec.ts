/* eslint-disable @typescript-eslint/no-explicit-any */
import { normalizeString } from "./normalize-string";

// Tests de tous les cas possibles
describe("normalizeString", () => {
  test("normalisation basique", () => {
    const tests = {
      éèêë: "eeee",
      àâäã: "aaaa",
      ïîì: "iii",
      ôöò: "ooo",
      ùûüũ: "uuuu",
      ÿ: "y",
      ç: "c",
      ñ: "n",
    };

    Object.entries(tests).forEach(([input, expected]) => {
      expect(normalizeString(input)).toBe(expected);
    });
  });

  test("cas spéciaux", () => {
    expect(normalizeString("œuf")).toBe("oeuf");
    expect(normalizeString("Æsop")).toBe("aesop");
  });

  test("espaces multiples", () => {
    expect(normalizeString("test    test")).toBe("test test");
    expect(normalizeString("test\t\ttest")).toBe("test test");
    expect(normalizeString("test\n\ntest")).toBe("test test");
    expect(normalizeString("  test  ")).toBe(" test ");
  });

  test("phrases complètes", () => {
    expect(normalizeString("L'été sera TRÈS chaud!")).toBe(
      "l ete sera tres chaud "
    );
    expect(normalizeString("Une chaîne avec\tdes\ttabulations")).toBe(
      "une chaine avec des tabulations"
    );
    expect(normalizeString("TEST@test.com")).toBe("test test com");
  });

  test("caractères spéciaux", () => {
    expect(normalizeString("100% sûr")).toBe("100 sur");
    expect(normalizeString("test&test")).toBe("test test");
    expect(normalizeString("prix: 15€")).toBe("prix 15 ");
  });

  test("cas limites", () => {
    expect(normalizeString("")).toBe("");
    expect(normalizeString("   ")).toBe(" ");
    // skipcq: JS-0323
    expect(normalizeString(null as any)).toBe("");
    expect(normalizeString(undefined as any)).toBe("");
  });
});
