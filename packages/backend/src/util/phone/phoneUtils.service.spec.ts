import { getPhoneString } from "./phoneUtils.service";

describe("Telephone utils", () => {
  it("getPhoneString shoud return empty string if telephone is null or undefined", () => {
    expect(getPhoneString(null)).toEqual("");
  });

  it("getPhoneString shoud return US indictaif", () => {
    expect(getPhoneString({ countryCode: "us", numero: "" })).toEqual("");
  });

  it("getPhoneString shoud return Guyane indictaif", () => {
    expect(getPhoneString({ countryCode: "gf", numero: "" })).toEqual("");
  });

  it("getPhoneString shoud return string with countryCode and numero", () => {
    expect(getPhoneString({ countryCode: "fr", numero: "0622062206" })).toEqual(
      "06 22 06 22 06"
    );
  });
});
