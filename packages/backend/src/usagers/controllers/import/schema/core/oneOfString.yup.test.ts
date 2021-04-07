import { oneOfString } from "./oneOfString.yup";

describe("oneOfString schema", () => {
  it("valid string", async () => {
    expect(
      await oneOfString(["APPLE", "BANANA", "ORANGE"]).validate("banana")
    ).toEqual("BANANA");
    expect(await oneOfString(["OUI", "NON"]).validate("NON")).toEqual("NON");
    expect(await oneOfString(["OUI", "NON"]).validate(undefined)).toEqual(
      undefined
    );
  });
  it("invalid string", async () => {
    await expect(
      oneOfString(["OUI", "NON"], {
        toUpperCase: false,
      }).validate("oui")
    ).rejects.toThrow();
    await expect(
      oneOfString(["one", "two"]).validate("three")
    ).rejects.toThrow();
  });
});
