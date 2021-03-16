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
});
