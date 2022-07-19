import { getPhoneString, getCountryCode } from "./phoneUtils.service";

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
      "+33 6 22 06 22 06"
    );
  });

  it("getCountryCode shoud return +33 if countryCode is undefined", () => {
    expect(getCountryCode("toto")).toEqual("+33");
  });

  it("getCountryCode shoud return +33 if countryCode is fr", () => {
    expect(getCountryCode("fr")).toEqual("+33");
  });

  it("getCountryCode shoud return +596 if countryCode is mq", () => {
    expect(getCountryCode("mq")).toEqual("+596");
  });

  it("getCountryCode shoud return +262 if countryCode is re", () => {
    expect(getCountryCode("re")).toEqual("+262");
  });

  it("getCountryCode shoud return +687 if countryCode is nc", () => {
    expect(getCountryCode("nc")).toEqual("+687");
  });
});
