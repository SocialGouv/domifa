import { BadRequestException } from "@nestjs/common";
import { tokenGenerator } from "../../../util";
import { ParseTokenPipe } from "../parse-pipes/parse-token.pipe";

describe("ParseTokenPipe", () => {
  let pipe: ParseTokenPipe;

  beforeEach(() => {
    pipe = new ParseTokenPipe();
  });

  describe("transform", () => {
    it("should transform a valid token", () => {
      const validTokens = [
        tokenGenerator.generateToken({ length: 30 }), // Token valide généré
        tokenGenerator.generateToken({ length: 30 }), // Token valide généré
        tokenGenerator.generateToken({ length: 30 }), // Token valide généré
      ];
      validTokens.forEach((token) => {
        const transformedToken = pipe.transform(token);
        expect(transformedToken).toBe(token);
      });
    });

    it("should throw BadRequestException for an invalid token", () => {
      const invalidTokens = [
        "ab", // Trop court (moins de 5 caractères)
        "abcdefg", // Trop long (plus de 5 caractères)
        "abc$123", // Caractère non autorisé ($)
        "12abc", // Mélange de chiffres et de lettres
        "aca68de ec357ed43a99405ae9cd84a0993ba0ac599228f9ce5", // Mélange de chiffres et de lettres
        null, // Valeur nulle
        undefined, // Valeur indéfinie
      ];

      invalidTokens.forEach((token) => {
        expect(() => {
          pipe.transform(token);
        }).toThrow(BadRequestException);
      });
    });
  });
});
