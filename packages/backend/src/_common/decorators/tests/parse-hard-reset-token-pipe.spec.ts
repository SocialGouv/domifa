import { BadRequestException } from "@nestjs/common";
import { ParseHardResetTokenPipe } from "../parse-pipes/parse-hard-reset-token.pipe";

describe("ParseHardResetTokenPipe", () => {
  let pipe: ParseHardResetTokenPipe;

  beforeEach(() => {
    pipe = new ParseHardResetTokenPipe();
  });

  describe("transform", () => {
    it("✅ should transform a valid token", () => {
      const validValues = [
        "VALIDTK", // Lettres en majuscules et chiffres (7 caractères)
        "VALID99", // Lettres en majuscules et chiffres (7 caractères)
        "1234567", // Chiffres uniquement (7 caractères)
        "ABCDEFG", // Lettres en majuscules uniquement (7 caractères)
      ];

      validValues.forEach((value) => {
        expect(pipe.transform(value)).toBe(value);
      });
    });

    it("🚩 should throw BadRequestException for an invalid token", () => {
      const invalidValues = [
        "invalidt", // Trop court (6 caractères au lieu de 7)
        "invalidto", // Trop long (8 caractères au lieu de 7)
        "InvalidT", // Caractères en mélange majuscules/minuscules
        "invalid!", // Caractère non autorisé (!)
        "   x   ", // Aucun caractère correspondant
        "    ", // Aucun caractère correspondant
        "ec357ed43a99405ae9cd84a0993ba0ac599228f9ce5",
      ];

      invalidValues.forEach((token) => {
        expect(() => {
          pipe.transform(token);
        }).toThrow(BadRequestException);
      });
    });
  });
});
