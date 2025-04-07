import { userUsagerLoginPasswordGenerator } from "../user-usager-login-password-generator.service";

describe("userUsagerLoginPasswordGenerator", () => {
  it("generateUniqueLogin", async () => {
    const login = await userUsagerLoginPasswordGenerator.generateUniqueLogin({
      checkAlreadyExists: false, // disable db check
    });
    expect(login).toBeDefined();
    expect(login.length).toEqual(8); // 8-size
    expect(login).toEqual(login.toUpperCase()); // uppercased
    expect(/^[A-Z]+$/.test(login)).toBeTruthy(); // only-letters
  });
  it("generateTemporyPassword", async () => {
    const { passwordHash, salt, temporaryPassword } =
      await userUsagerLoginPasswordGenerator.generateTemporyPassword();
    expect(salt).toBeDefined();
    expect(temporaryPassword).toBeDefined();
    expect(passwordHash).toBeDefined();
    expect(temporaryPassword.length).toEqual(8); // 8-size
    expect(/^\d+$/.test(temporaryPassword)).toBeTruthy(); // only-numbers
  });
});
