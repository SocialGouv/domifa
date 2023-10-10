import { cleanCity } from "../clean-city";

const CITIES_TO_CHECK = [
  { city: "Lyon cedex 02", formattedCity: "Lyon" },
  { city: "CERGY-PONTOISE", formattedCity: "Cergy pontoise" },
  { city: "DUNKERQUE CEDEX 1", formattedCity: "Dunkerque" },
  { city: "Paris 7ème arrondissement", formattedCity: "Paris" },
  { city: "1", formattedCity: "" },
  {
    city: "50500 - CARENTAN LES MARAIS",
    formattedCity: "Carentan les marais",
  },
  { city: "achicourt", formattedCity: "Achicourt" },
];

describe("cleanCity", () => {
  it.each(CITIES_TO_CHECK)(`Clean city: $city`, (value) => {
    expect(cleanCity(value.city)).toEqual(value.formattedCity);
  });
});
