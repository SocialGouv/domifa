/* eslint-disable id-denylist */
import { CountryISO } from "@khazii/ngx-intl-tel-input";
import { setFormPhone } from "./phoneUtils";

describe("Téléphones pour les formulaires", () => {
  it("❌ setFormPhone avec un mauvais numéro", () => {
    expect(
      setFormPhone({ countryCode: CountryISO.UnitedStates, numero: "" })
    ).toEqual({ countryCode: "us", number: "" });

    expect(
      setFormPhone({
        countryCode: CountryISO.UnitedStates,
        numero: "NUMBER_FAIL",
      })
    ).toEqual({ countryCode: "us", number: "" });

    expect(
      setFormPhone({
        countryCode: CountryISO.France,
        numero: "2126063600",
      })
    ).toEqual({ countryCode: "fr", number: "" });
  });

  it("✅ setFormPhone avec un mauvais numéro", () => {
    expect(
      setFormPhone({
        countryCode: CountryISO.UnitedStates,
        numero: " 212-606-3600",
      })
    ).toEqual({ countryCode: "us", number: "2126063600" });

    expect(
      setFormPhone({
        countryCode: CountryISO.UnitedStates,
        numero: " 212 606 3600",
      })
    ).toEqual({ countryCode: "us", number: "2126063600" });

    expect(
      setFormPhone({
        countryCode: CountryISO.France,
        numero: "6 06-060606",
      })
    ).toEqual({ countryCode: "fr", number: "606060606" });

    expect(
      setFormPhone({
        countryCode: CountryISO.France,
        numero: "0606060606",
      })
    ).toEqual({ countryCode: "fr", number: "606060606" });

    // Mayotte
    expect(
      setFormPhone({
        countryCode: CountryISO.Mayotte,
        numero: "269 63 50 00",
      })
    ).toEqual({ countryCode: "yt", number: "269635000" });

    // Réunion
    // Même indicatif que Mayotte + 262
    expect(
      setFormPhone({
        countryCode: CountryISO.Réunion,
        numero: " 262 39/ 50.50",
      })
    ).toEqual({ countryCode: "re", number: "262395050" });

    expect(
      setFormPhone({
        countryCode: CountryISO.Guadeloupe,
        numero: "590 99 39 00",
      })
    ).toEqual({ countryCode: "gp", number: "590993900" });

    expect(
      setFormPhone({
        countryCode: CountryISO.Martinique,
        numero: "05 96 66 68 88",
      })
    ).toEqual({ countryCode: "mq", number: "596666888" });

    expect(
      setFormPhone({
        countryCode: CountryISO.FrenchGuiana,
        numero: "594--39.70.70",
      })
    ).toEqual({ countryCode: "gf", number: "594397070" });
  });
});
