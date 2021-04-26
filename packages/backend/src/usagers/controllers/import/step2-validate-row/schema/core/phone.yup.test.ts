import { phone } from "./phone.yup";

describe("phone schema", () => {
  it("valid phone", async () => {
    expect(await phone().validate("0102030405")).toEqual("0102030405");
    expect(await phone().validate("01 02 03 04 05")).toEqual("0102030405");
    expect(await phone().validate("01-02-03-04-05")).toEqual("0102030405");
    expect(await phone().validate("01/02/03/04/05")).toEqual("0102030405");
  });
  it("invalid phone", async () => {
    await expect(phone().validate("01 02 trois")).rejects.toThrow();
  });
});
