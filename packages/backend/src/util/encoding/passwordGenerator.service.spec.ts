import { passwordGenerator } from "./passwordGenerator.service";

describe("passwordGenerator", () => {
  it("passwordGenerator.generateHash+checkPassword with number salt", async () => {
    {
      const password = "6sdf@dfSG_ZGER56";
      const hash = await passwordGenerator.generatePasswordHash({
        password,
        salt: 10,
      });
      expect(
        await passwordGenerator.checkPassword({ password, hash })
      ).toBeTruthy();
      expect(
        await passwordGenerator.checkPassword({
          password: password + "_invalid",
          hash,
        })
      ).toBeFalsy();
    }
  });
  it("passwordGenerator.generateHash+checkPassword with default salt", async () => {
    {
      const password = "6s6ds5f4g_#df@dfSG_ZGEsdq5fR56";
      const hash = await passwordGenerator.generatePasswordHash({
        password,
      });
      expect(
        await passwordGenerator.checkPassword({ password, hash })
      ).toBeTruthy();
      expect(
        await passwordGenerator.checkPassword({
          password: password + "_invalid",
          hash,
        })
      ).toBeFalsy();
    }
  });
  it("passwordGenerator.generateHash+checkPassword with dynamic token salt", async () => {
    {
      const password = "6s6ds5f4g_#df@dfSG_ZGER56";
      const hash = await passwordGenerator.generatePasswordHash({
        password,
        salt: 5,
      });
      expect(
        await passwordGenerator.checkPassword({ password, hash })
      ).toBeTruthy();
      expect(
        await passwordGenerator.checkPassword({
          password: password + "_invalid",
          hash,
        })
      ).toBeFalsy();
    }
  });

  it("passwordGenerator.generateRandomPasswordHash", async () => {
    {
      const hash = await passwordGenerator.generateRandomPasswordHash();
      expect(hash.length).toEqual(60);
    }
  });
});
