import {
  telephoneString,
  telephoneIndicatif,
  telephoneFixIndicatif,
} from "./telephoneString.service";

describe("Telephone utils", () => {
  it("telephoneString shoud return empty string if telephone is null or undefined", () => {
    expect(telephoneString(null)).toEqual("");
  });

  it("telephoneString shoud return US indictaif", () => {
    expect(telephoneString({ indicatif: "us", numero: "" })).toEqual("+1");
  });

  it("telephoneString shoud return Guyane indictaif", () => {
    expect(telephoneString({ indicatif: "gf", numero: "" })).toEqual("+594");
  });

  it("telephoneString shoud return string with indicatif if numero is empty", () => {
    expect(telephoneString({ indicatif: "fr", numero: "" })).toEqual("+33");
  });

  it("telephoneString shoud return string with indicatif and numero", () => {
    expect(telephoneString({ indicatif: "fr", numero: "0622062206" })).toEqual(
      "+330622062206"
    );
  });

  it("telephoneIndicatif shoud return +33 if indicatif is undefined", () => {
    expect(telephoneIndicatif("toto")).toEqual("+33");
  });

  it("telephoneIndicatif shoud return +33 if indicatif is fr", () => {
    expect(telephoneIndicatif("fr")).toEqual("+33");
  });

  it("telephoneIndicatif shoud return +596 if indicatif is mq", () => {
    expect(telephoneIndicatif("mq")).toEqual("+596");
  });

  it("telephoneIndicatif shoud return +262 if indicatif is re", () => {
    expect(telephoneIndicatif("re")).toEqual("+262");
  });

  it("telephoneIndicatif shoud return +687 if indicatif is nc", () => {
    expect(telephoneIndicatif("nc")).toEqual("+687");
  });

  it("telephoneFixIndicatif shoud return +33 without the first 0 if indicatif is fr", () => {
    expect(telephoneFixIndicatif("fr", "0620202020")).toEqual("+33620202020");
  });

  it("telephoneFixIndicatif shoud return normally if indicatif other than fr", () => {
    expect(telephoneFixIndicatif("nc", "912969")).toEqual("+687912969");
  });
});
