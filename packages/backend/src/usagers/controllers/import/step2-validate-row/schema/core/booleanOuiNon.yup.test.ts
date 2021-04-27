import { booleanOuiNon } from "./booleanOuiNon.yup";

describe("booleanOuiNon schema", () => {
  it("valid string", async () => {
    expect(await booleanOuiNon().validate("oui")).toEqual(true);
    expect(await booleanOuiNon().validate("NON")).toEqual(false);
    expect(await booleanOuiNon().validate(undefined)).toEqual(undefined);
  });
  it("invalid string", async () => {
    await expect(booleanOuiNon().validate("yes")).rejects.toThrow();
  });
});
