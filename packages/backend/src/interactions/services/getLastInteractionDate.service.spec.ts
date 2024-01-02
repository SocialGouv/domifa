import { getMostRecentInteractionDate } from "./getLastInteractionDate.service";

describe("getMostRecentInteractionDate", () => {
  it("'dateDebut' > dateInteraction, on renvoie date de début de décision", () => {
    const usager: any = {
      decision: {
        dateDebut: new Date("2026-08-29T13:24:56.563Z"),
      },
    };
    expect(
      getMostRecentInteractionDate(usager, new Date("2021-08-29T13:24:56.563Z"))
    ).toEqual(new Date("2026-08-29T13:24:56.563Z"));
  });

  it("'dateDebut' < dateInteraction, on renvoie date d'interaction", () => {
    const usager: any = {
      decision: {
        dateDebut: new Date("2026-08-29T13:24:56.563Z"),
      },
    };
    expect(
      getMostRecentInteractionDate(usager, new Date("2029-08-29T13:24:56.563Z"))
    ).toEqual(new Date("2029-08-29T13:24:56.563Z"));
  });
});
