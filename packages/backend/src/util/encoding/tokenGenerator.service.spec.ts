import { tokenGenerator } from "./tokenGenerator.service";

describe("tokenGenerator", () => {
  it("tokenGenerator.generateToken", () => {
    {
      const token = tokenGenerator.generateToken({ length: 10 });
      expect(token).toBeDefined();
      expect(token.length).toEqual(20);
    }
    {
      const token = tokenGenerator.generateToken({ length: 64 });
      expect(token).toBeDefined();
      expect(token.length).toEqual(128);
    }
  });
  it("tokenGenerator.generateString", () => {
    {
      const token = tokenGenerator.generateString({ length: 10 });
      expect(token).toBeDefined();
      expect(token.length).toEqual(10);
    }
    const charsToExclude = "abcdefghijklmnopkrstuvwxyABCDEFGHIJKLMNOPKRSTUVWXY";
    for (let i = 0; i < 100; i++) {
      const token = tokenGenerator.generateString({
        length: 1,
        charsToExclude,
      });
      expect(token).toBeDefined();
      expect(token.length).toEqual(1);
      expect(charsToExclude.includes(token)).toBeFalsy();
    }
  });
});
