import { booleanOuiNon } from "./booleanOuiNon.yup";

describe("booleanOuiNon schema", () => {
  it("valid string", async () => {
    expect(await booleanOuiNon().validate("OUI")).toEqual(true);
    expect(await booleanOuiNon().validate("oui")).toEqual(true);
    expect(await booleanOuiNon().validate("NON")).toEqual(false);
    expect(await booleanOuiNon().validate("Non")).toEqual(false);
    expect(await booleanOuiNon().validate(undefined)).toEqual(undefined);
    expect(await booleanOuiNon().validate(true)).toEqual(true);
  });

  it("invalid string", async () => {
    await expect(
      booleanOuiNon().validate(new Date("2020-10-12"))
    ).rejects.toThrow();

    await expect(booleanOuiNon().validate("")).rejects.toThrow();
    await expect(booleanOuiNon().validate({})).rejects.toThrow();
    await expect(booleanOuiNon().validate(120)).rejects.toThrow();
    await expect(booleanOuiNon().validate("yes")).rejects.toThrow();
  });
});
