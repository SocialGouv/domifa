import { REGIONS_DEF } from "../../../territoires";
import {
  getManagedRegionCodes,
  isRegionUsersManager,
} from "./getManagedRegionCodes";

describe("isRegionUsersManager", () => {
  it("is true for the DREETS and the DGCS only", () => {
    expect(isRegionUsersManager("region")).toBe(true);
    expect(isRegionUsersManager("national")).toBe(true);
    expect(isRegionUsersManager("department")).toBe(false);
    expect(isRegionUsersManager("super-admin-domifa")).toBe(false);
    expect(isRegionUsersManager(undefined)).toBe(false);
  });
});

describe("getManagedRegionCodes", () => {
  it("returns the own regions of a DREETS", () => {
    expect(
      getManagedRegionCodes({ role: "region", territories: ["53"] })
    ).toEqual(["53"]);
  });

  it("returns every region for the DGCS, whatever its territories", () => {
    expect(
      getManagedRegionCodes({ role: "national", territories: [] })
    ).toEqual(REGIONS_DEF.map((region) => region.regionCode));
  });

  it("returns nothing for the other roles", () => {
    expect(
      getManagedRegionCodes({ role: "department", territories: ["35"] })
    ).toEqual([]);
    expect(
      getManagedRegionCodes({ role: "super-admin-domifa", territories: [] })
    ).toEqual([]);
  });
});
