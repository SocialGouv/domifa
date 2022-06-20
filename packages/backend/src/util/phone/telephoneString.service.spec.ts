import {
  telephoneString,
  getIndicatif,
  telephoneFixCountryCode,
} from "./telephoneString.service";

describe("Telephone utils", () => {
  it("telephoneString shoud return empty string if telephone is null or undefined", () => {
    expect(telephoneString(null)).toEqual("");
  });

  it("telephoneString shoud return US indictaif", () => {
    expect(telephoneString({ countryCode: "us", numero: "" })).toEqual("+1");
  });

  it("telephoneString shoud return Guyane indictaif", () => {
    expect(telephoneString({ countryCode: "gf", numero: "" })).toEqual("+594");
  });

  it("telephoneString shoud return string with countryCode if numero is empty", () => {
    expect(telephoneString({ countryCode: "fr", numero: "" })).toEqual("+33");
  });

  it("telephoneString shoud return string with countryCode and numero", () => {
    expect(
      telephoneString({ countryCode: "fr", numero: "0622062206" })
    ).toEqual("+330622062206");
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
