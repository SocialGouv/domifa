import { languagesAutocomplete } from "./languages-autocomplete.util";

it("languagesAutocomplete._filterLanguages", () => {
  expect(
    languagesAutocomplete._filterLanguages("fRa", {
      maxResults: 3,
    })
  ).toEqual(["fr"]);
  expect(
    languagesAutocomplete._filterLanguages("qsdfsdf", {
      maxResults: 1000,
    })
  ).toEqual([]);
  expect(
    languagesAutocomplete._filterLanguages("al", {
      maxResults: 5,
    })
  ).toEqual([
    "sq", // albanais
    "de", // allemand
    "bn", // bengali
    "ca", // catalan
    "fy", // frison occidental
  ]);
});

it("languagesAutocomplete._isInvalid", () => {
  expect(languagesAutocomplete._isInvalid(undefined)).toBeFalsy();
  expect(languagesAutocomplete._isInvalid("fr")).toBeFalsy();
  expect(languagesAutocomplete._isInvalid("en")).toBeFalsy();
  expect(languagesAutocomplete._isInvalid("it")).toBeFalsy();
  expect(languagesAutocomplete._isInvalid("xxdsofijsd")).toBeTruthy();
});
