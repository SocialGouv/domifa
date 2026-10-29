import {
  isDreetsEmailForRegion,
  isDreetsSelfServiceRegion,
} from "./isDreetsEmailForRegion";

describe("isDreetsEmailForRegion", () => {
  it("accepts the domain of the region", () => {
    expect(isDreetsEmailForRegion("jean.dupont@dreets.gouv.fr", "53")).toBe(
      true
    );
    expect(isDreetsEmailForRegion(" Jean.Dupont@DRIEETS.gouv.fr ", "11")).toBe(
      true
    );
    expect(isDreetsEmailForRegion("marie.martin@deets.gouv.fr", "01")).toBe(
      true
    );
  });

  it("rejects the domain of another kind of region", () => {
    expect(isDreetsEmailForRegion("jean.dupont@dreets.gouv.fr", "11")).toBe(
      false
    );
    expect(isDreetsEmailForRegion("jean.dupont@drieets.gouv.fr", "53")).toBe(
      false
    );
  });

  it("rejects departmental addresses", () => {
    expect(
      isDreetsEmailForRegion("jean.dupont@ille-et-vilaine.gouv.fr", "53")
    ).toBe(false);
  });

  it("accepts a local part without a dot", () => {
    expect(isDreetsEmailForRegion("jdupont@dreets.gouv.fr", "53")).toBe(true);
  });

  it("rejects regions outside the allowlist", () => {
    expect(isDreetsEmailForRegion("jean.dupont@dieccte.gouv.fr", "03")).toBe(
      false
    );
    expect(isDreetsSelfServiceRegion("03")).toBe(false);
    expect(isDreetsSelfServiceRegion("53")).toBe(true);
  });
});
