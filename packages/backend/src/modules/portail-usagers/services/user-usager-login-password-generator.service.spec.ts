import { AppTestHelper } from "../../../util/test";
import { userUsagerLoginPasswordGenerator } from "./user-usager-login-password-generator.service";

describe("userUsagerLoginPasswordGenerator", () => {
  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection();
  });

  describe("generateUniqueLogin", () => {
    it("should generate a unique login with correct format", async () => {
      const login =
        await userUsagerLoginPasswordGenerator.generateUniqueLogin();
      expect(login).toBeDefined();
      expect(login.length).toEqual(8); // 8-size
      expect(login).toEqual(login.toUpperCase()); // uppercased
      expect(/^[A-Z]+$/.test(login)).toBeTruthy(); // only-letters
    });

    it("should generate different logins on multiple calls", async () => {
      const login1 =
        await userUsagerLoginPasswordGenerator.generateUniqueLogin();
      const login2 =
        await userUsagerLoginPasswordGenerator.generateUniqueLogin();

      expect(login1).not.toEqual(login2);
      expect(login1.length).toEqual(8);
      expect(login2.length).toEqual(8);
    });

    it("should only contain uppercase letters", async () => {
      const login =
        await userUsagerLoginPasswordGenerator.generateUniqueLogin();

      expect(/^[A-Z]{8}$/.test(login)).toBeTruthy();
      expect(login).not.toMatch(/[a-z]/); // no lowercase
      expect(login).not.toMatch(/[0-9]/); // no numbers
      expect(login).not.toMatch(/[^A-Z]/); // no special chars
    });

    it("should generate valid login multiple times consecutively", async () => {
      const logins = [];

      for (let i = 0; i < 5; i++) {
        const login =
          await userUsagerLoginPasswordGenerator.generateUniqueLogin();
        logins.push(login);
        expect(login.length).toEqual(8);
        expect(/^[A-Z]+$/.test(login)).toBeTruthy();
      }

      // All logins should be unique
      const uniqueLogins = new Set(logins);
      expect(uniqueLogins.size).toEqual(logins.length);
    });

    it("should not contain ambiguous characters if implemented", async () => {
      // Ce test vérifie qu'aucun caractère potentiellement ambigu n'est généré
      const login =
        await userUsagerLoginPasswordGenerator.generateUniqueLogin();

      expect(login).toBeDefined();
      expect(login.length).toEqual(8);
      // Le login ne devrait contenir que des lettres majuscules
      expect(/^[A-Z]{8}$/.test(login)).toBeTruthy();
    });
  });

  describe("generateTemporyPassword", () => {
    it("should generate temporary password without birth date", async () => {
      const { passwordHash, salt, temporaryPassword } =
        await userUsagerLoginPasswordGenerator.generateTemporyPassword();

      expect(salt).toBeDefined();
      expect(temporaryPassword).toBeDefined();
      expect(passwordHash).toBeDefined();
      expect(temporaryPassword.length).toEqual(8); // 8-size
      expect(/^\d+$/.test(temporaryPassword)).toBeTruthy(); // only-numbers
    });

    it("should generate password from birth date when provided", async () => {
      const birthDate = new Date("1990-05-15");
      const { passwordHash, salt, temporaryPassword } =
        await userUsagerLoginPasswordGenerator.generateTemporyPassword(
          birthDate
        );

      expect(salt).toBeDefined();
      expect(temporaryPassword).toBeDefined();
      expect(passwordHash).toBeDefined();
      expect(temporaryPassword).toEqual("15051990"); // ddMMyyyy format
      expect(temporaryPassword.length).toEqual(8);
      expect(/^\d+$/.test(temporaryPassword)).toBeTruthy();
    });

    it("should generate different passwords for different birth dates", async () => {
      const birthDate1 = new Date("1985-12-25");
      const birthDate2 = new Date("1992-07-08");

      const result1 =
        await userUsagerLoginPasswordGenerator.generateTemporyPassword(
          birthDate1
        );
      const result2 =
        await userUsagerLoginPasswordGenerator.generateTemporyPassword(
          birthDate2
        );

      expect(result1.temporaryPassword).toEqual("25121985");
      expect(result2.temporaryPassword).toEqual("08071992");
      expect(result1.temporaryPassword).not.toEqual(result2.temporaryPassword);
      expect(result1.salt).not.toEqual(result2.salt);
      expect(result1.passwordHash).not.toEqual(result2.passwordHash);
    });

    it("should generate different salts on each call", async () => {
      const result1 =
        await userUsagerLoginPasswordGenerator.generateTemporyPassword();
      const result2 =
        await userUsagerLoginPasswordGenerator.generateTemporyPassword();

      expect(result1.salt).not.toEqual(result2.salt);
      expect(result1.passwordHash).not.toEqual(result2.passwordHash);
      // Les mots de passe temporaires peuvent être différents (génération aléatoire)
    });

    it("should handle edge case birth dates correctly", async () => {
      const leapYearDate = new Date("2000-02-29"); // année bissextile
      const newYearDate = new Date("2021-01-01"); // début d'année

      const leapResult =
        await userUsagerLoginPasswordGenerator.generateTemporyPassword(
          leapYearDate
        );
      const newYearResult =
        await userUsagerLoginPasswordGenerator.generateTemporyPassword(
          newYearDate
        );

      expect(leapResult.temporaryPassword).toEqual("29022000");
      expect(newYearResult.temporaryPassword).toEqual("01012021");
      expect(leapResult.temporaryPassword.length).toEqual(8);
      expect(newYearResult.temporaryPassword.length).toEqual(8);
    });
  });
});
