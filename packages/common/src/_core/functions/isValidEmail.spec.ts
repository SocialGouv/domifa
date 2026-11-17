import { isValidEmail } from "./isValidEmail";

describe("isValidEmail", () => {
  it("accepts valid emails", () => {
    for (const email of [
      "simple.email@example.com",
      "78@pole-emploi.fr",
      "firstname+tag+sorting@example.com",
    ]) {
      expect(isValidEmail(email)).toBe(true);
    }
  });

  it("rejects invalid emails and non-string values", () => {
    for (const value of [
      "",
      " @ ",
      "plainaddress",
      "username@.com",
      "a@b",
      ["a@b.fr"],
      null,
      undefined,
    ]) {
      expect(isValidEmail(value)).toBe(false);
    }
  });
});
