import { telephoneString } from "./telephoneString.service";

describe("telephoneString", () => {
  it("shoud return empty string if telephone is null or undefined", () => {
    expect(telephoneString(null)).toEqual("");
  });

  it("shoud return string with indicatif if numero is empty", () => {
    expect(telephoneString({ indicatif: "+33", numero: "" })).toEqual("+33");
  });

  it("shoud return string with indicatif and numero", () => {
    expect(telephoneString({ indicatif: "+33", numero: "0622062206" })).toEqual(
      "+330622062206"
    );
  });
});
