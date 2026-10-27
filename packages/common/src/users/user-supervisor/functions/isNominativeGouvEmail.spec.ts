import { isNominativeGouvEmail } from "./isNominativeGouvEmail";
import { getRegionDepartmentCodes } from "./getRegionDepartmentCodes";

describe("isNominativeGouvEmail", () => {
  it.each([
    "prenom.nom@seine-saint-denis.gouv.fr",
    "Jean-Pierre.Martin@nord.gouv.fr",
    "marie.dupont-durand@bouches-du-rhone.gouv.fr",
  ])("accepts %s", (email) => {
    expect(isNominativeGouvEmail(email)).toBe(true);
  });

  it.each([
    "prenom.nom@gmail.com",
    "contact@nord.gouv.fr",
    "prenom.nom@fabrique.social.gouv.fr",
    "prenom.nom@nord.gouv.fr.evil.com",
    "",
    null,
    undefined,
  ])("rejects %s", (email) => {
    expect(isNominativeGouvEmail(email)).toBe(false);
  });
});

describe("getRegionDepartmentCodes", () => {
  it("returns the departments of a region", () => {
    expect(getRegionDepartmentCodes(["53"]).sort()).toEqual(
      ["22", "29", "35", "56"].sort()
    );
  });

  it("returns nothing for an unknown region", () => {
    expect(getRegionDepartmentCodes(["XX"])).toEqual([]);
  });
});
