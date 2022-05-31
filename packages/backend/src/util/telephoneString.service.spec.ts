import { formatInternationalPhoneNumber } from "./telephoneString.service";

describe("Telephone utils", () => {
  it("formatInternationalPhoneNumber shoud return empty string if telephone is null or undefined", () => {
    expect(formatInternationalPhoneNumber(null)).toEqual("");
  });

  it("formatInternationalPhoneNumber shoud return empty string if numero is empty", () => {
    expect(
      formatInternationalPhoneNumber({ indicatif: "gf", numero: "" })
    ).toEqual("");
  });

  it("formatInternationalPhoneNumber shoud return empty string if indicatif is empty", () => {
    expect(
      formatInternationalPhoneNumber({ indicatif: "", numero: "" })
    ).toEqual("");
  });

  it("formatInternationalPhoneNumber shoud return string with international phone number", () => {
    expect(
      formatInternationalPhoneNumber({ indicatif: "fr", numero: "0622062206" })
    ).toEqual("+33 6 22 06 22 06");
  });

  it("formatInternationalPhoneNumber shoud return string with indicatif if numero is empty", () => {
    expect(
      formatInternationalPhoneNumber({ indicatif: "gf", numero: "594101010" })
    ).toEqual("+594 594 10 10 10");
  });
});
