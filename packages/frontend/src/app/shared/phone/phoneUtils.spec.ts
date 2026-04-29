/* eslint-disable id-denylist */

import { setFormPhone } from "./phoneUtils";

describe("Téléphones pour les formulaires", () => {
  it("❌ setFormPhone avec un mauvais numéro", () => {
    expect(setFormPhone({ countryCode: "us", numero: "" })).toEqual({
      countryCode: "us",
      numero: "",
    });

    expect(
      setFormPhone({
        countryCode: "us",
        numero: "NUMBER_FAIL",
      })
    ).toEqual({ countryCode: "us", numero: "" });

    expect(
      setFormPhone({
        countryCode: "fr",
        numero: "2126063600",
      })
    ).toEqual({ countryCode: "fr", numero: "" });
  });

  it("✅ setFormPhone avec un mauvais numéro", () => {
    expect(
      setFormPhone({
        countryCode: "us",
        numero: " 212-606-3600",
      })
    ).toEqual({ countryCode: "us", numero: "2126063600" });

    expect(
      setFormPhone({
        countryCode: "us",
        numero: " 212 606 3600",
      })
    ).toEqual({ countryCode: "us", numero: "2126063600" });

    expect(
      setFormPhone({
        countryCode: "fr",
        numero: "6 06-060606",
      })
    ).toEqual({ countryCode: "fr", numero: "606060606" });

    expect(
      setFormPhone({
        countryCode: "fr",
        numero: "0606060606",
      })
    ).toEqual({ countryCode: "fr", numero: "606060606" });

    // Mayotte
    expect(
      setFormPhone({
        countryCode: "yt",
        numero: "269 63 50 00",
      })
    ).toEqual({ countryCode: "yt", numero: "269635000" });

    // Réunion
    // Même indicatif que Mayotte + 262
    expect(
      setFormPhone({
        countryCode: "re",
        numero: " 262 39/ 50.50",
      })
    ).toEqual({ countryCode: "re", numero: "262395050" });

    expect(
      setFormPhone({
        countryCode: "gp",
        numero: "590 99 39 00",
      })
    ).toEqual({ countryCode: "gp", numero: "590993900" });

    expect(
      setFormPhone({
        countryCode: "mq",
        numero: "05 96 66 68 88",
      })
    ).toEqual({ countryCode: "mq", numero: "596666888" });

    expect(
      setFormPhone({
        countryCode: "gf",
        numero: "594--39.70.70",
      })
    ).toEqual({ countryCode: "gf", numero: "594397070" });
  });
});
