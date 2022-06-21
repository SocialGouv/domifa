import {
  getPhoneString,
  getIndicatif,
  telephoneFixCountryCode,
} from "./phoneUtils.service";

describe("Telephone utils", () => {
  it("getPhoneString shoud return empty string if telephone is null or undefined", () => {
    expect(getPhoneString(null)).toEqual("");
  });

  it("getPhoneString shoud return US indictaif", () => {
    expect(getPhoneString({ countryCode: "us", numero: "" })).toEqual("+1");
  });

  it("getPhoneString shoud return Guyane indictaif", () => {
    expect(getPhoneString({ countryCode: "gf", numero: "" })).toEqual("+594");
  });

  it("getPhoneString shoud return string with countryCode if numero is empty", () => {
    expect(getPhoneString({ countryCode: "fr", numero: "" })).toEqual("+33");
  });

  it("getPhoneString shoud return string with countryCode and numero", () => {
    expect(getPhoneString({ countryCode: "fr", numero: "0622062206" })).toEqual(
      "+330622062206"
    );
  });

  it("telephoneFixCountryCode shoud return +33 if countryCode is undefined", () => {
    expect(getIndicatif("toto")).toEqual("+33");
  });

  it("telephoneFixCountryCode shoud return +33 if countryCode is fr", () => {
    expect(getIndicatif("fr")).toEqual("+33");
  });

  it("telephoneFixCountryCode shoud return +596 if countryCode is mq", () => {
    expect(getIndicatif("mq")).toEqual("+596");
  });

  it("telephoneFixCountryCode shoud return +262 if countryCode is re", () => {
    expect(getIndicatif("re")).toEqual("+262");
  });

  it("telephoneFixCountryCode shoud return +687 if countryCode is nc", () => {
    expect(getIndicatif("nc")).toEqual("+687");
  });

  it("telephoneFixCountryCode shoud return +33 without the first 0 if countryCode is fr", () => {
    expect(telephoneFixCountryCode("fr", "0620202020")).toEqual("+33620202020");
  });

  it("telephoneFixCountryCode shoud return normally if countryCode other than fr", () => {
    expect(telephoneFixCountryCode("nc", "912969")).toEqual("+687912969");
  });
});
