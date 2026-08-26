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

describe("getPhoneString — international input", () => {
  it("reads +33 / 0033 prefixes and formats them nationally", () => {
    for (const numero of [
      "+33612345678",
      "+33 6 12 34 56 78",
      "0033612345678",
      "+33 (0)6 12 34 56 78",
    ]) {
      expect(getPhoneString({ countryCode: "fr", numero })).toEqual(
        "06 12 34 56 78"
      );
    }
  });

  it("keeps the + so a number from another region than countryCode is still read", () => {
    expect(
      getPhoneString({
        countryCode: "fr",
        numero: "+262 692 12 34 56",
      }).replace(/\s+/g, "")
    ).toEqual("0692123456");
  });

  it("does not mutate its argument", () => {
    const telephone = { countryCode: "fr", numero: "06-12-34-56-78" };
    getPhoneString(telephone);
    expect(telephone.numero).toEqual("06-12-34-56-78");
  });
});
