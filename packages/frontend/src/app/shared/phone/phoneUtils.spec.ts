/* eslint-disable id-denylist */
import { Iso2 } from "intl-tel-input/data";
import { setFormPhone } from "./phoneUtils";

describe("Téléphones pour les formulaires", () => {
  it("❌ setFormPhone avec un mauvais numéro", () => {
    expect(setFormPhone({ countryCode: "us" as Iso2, numero: "" })).toEqual({
      countryCode: "us",
      numero: "",
    });

    expect(
      setFormPhone({
        countryCode: "us" as Iso2,
        numero: "NUMBER_FAIL",
      })
    ).toEqual({ countryCode: "us", numero: "" });

    expect(
      setFormPhone({
        countryCode: "fr" as Iso2,
        numero: "2126063600",
      })
    ).toEqual({ countryCode: "fr", numero: "" });
  });

  it("✅ setFormPhone avec un mauvais numéro", () => {
    expect(
      setFormPhone({
        countryCode: "us" as Iso2,
        numero: " 212-606-3600",
      })
    ).toEqual({ countryCode: "us", numero: "2126063600" });

    expect(
      setFormPhone({
        countryCode: "us" as Iso2,
        numero: " 212 606 3600",
      })
    ).toEqual({ countryCode: "us", numero: "2126063600" });

    expect(
      setFormPhone({
        countryCode: "fr" as Iso2,
        numero: "6 06-060606",
      })
    ).toEqual({ countryCode: "fr", numero: "606060606" });

    expect(
      setFormPhone({
        countryCode: "fr" as Iso2,
        numero: "0606060606",
      })
    ).toEqual({ countryCode: "fr", numero: "606060606" });

    // Mayotte
    expect(
      setFormPhone({
        countryCode: "yt" as Iso2,
        numero: "269 63 50 00",
      })
    ).toEqual({ countryCode: "yt", numero: "269635000" });

    // Réunion
    // Même indicatif que Mayotte + 262
    expect(
      setFormPhone({
        countryCode: "re" as Iso2,
        numero: " 262 39/ 50.50",
      })
    ).toEqual({ countryCode: "re", numero: "262395050" });

    expect(
      setFormPhone({
        countryCode: "gp" as Iso2,
        numero: "590 99 39 00",
      })
    ).toEqual({ countryCode: "gp", numero: "590993900" });

    expect(
      setFormPhone({
        countryCode: "mq" as Iso2,
        numero: "05 96 66 68 88",
      })
    ).toEqual({ countryCode: "mq", numero: "596666888" });

    expect(
      setFormPhone({
        countryCode: "gf" as Iso2,
        numero: "594--39.70.70",
      })
    ).toEqual({ countryCode: "gf", numero: "594397070" });
  });
});
