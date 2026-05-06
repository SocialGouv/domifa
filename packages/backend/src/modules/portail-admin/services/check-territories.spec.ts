import { UserAdminAuthenticated } from "../../../_common/model";
import { MetabaseStatsDto } from "../dto";
import { checkTerritories, resolveTerritoryFilter } from "./check-territories";

const buildUser = (
  role: UserAdminAuthenticated["role"],
  territories: string[] = []
): UserAdminAuthenticated =>
  ({
    id: 1,
    role,
    territories,
  } as UserAdminAuthenticated);

const buildDto = (
  overrides: Partial<MetabaseStatsDto> = {}
): MetabaseStatsDto =>
  ({
    year: 2025,
    ...overrides,
  } as MetabaseStatsDto);

describe("resolveTerritoryFilter", () => {
  describe("national / super-admin", () => {
    it("returns empty arrays when DTO has no filter", () => {
      const out = resolveTerritoryFilter(buildUser("national"), buildDto());
      expect(out).toEqual({ region: [], department: [] });
    });

    it("returns DTO region for national user", () => {
      const out = resolveTerritoryFilter(
        buildUser("super-admin-domifa"),
        buildDto({ region: "11" })
      );
      expect(out).toEqual({ region: ["11"], department: [] });
    });

    it("returns DTO department for national user", () => {
      const out = resolveTerritoryFilter(
        buildUser("national"),
        buildDto({ department: "75" })
      );
      expect(out).toEqual({ region: [], department: ["75"] });
    });
  });

  describe("region role", () => {
    it("rejects when user has no territories", () => {
      expect(
        resolveTerritoryFilter(buildUser("region", []), buildDto())
      ).toBeNull();
    });

    it("forces user's region when DTO is empty (no national leak)", () => {
      const out = resolveTerritoryFilter(
        buildUser("region", ["11"]),
        buildDto()
      );
      expect(out).toEqual({ region: ["11"], department: [] });
    });

    it("forces all user's regions when DTO is empty and user has multiple", () => {
      const out = resolveTerritoryFilter(
        buildUser("region", ["11", "32"]),
        buildDto()
      );
      expect(out).toEqual({ region: ["11", "32"], department: [] });
    });

    it("accepts DTO region when it matches user's territory", () => {
      const out = resolveTerritoryFilter(
        buildUser("region", ["11", "32"]),
        buildDto({ region: "32" })
      );
      expect(out).toEqual({ region: ["32"], department: [] });
    });

    it("rejects DTO region outside user's territory", () => {
      expect(
        resolveTerritoryFilter(
          buildUser("region", ["11"]),
          buildDto({ region: "32" })
        )
      ).toBeNull();
    });

    it("accepts DTO department inside user's region", () => {
      const out = resolveTerritoryFilter(
        buildUser("region", ["11"]),
        buildDto({ department: "75" })
      );
      expect(out).toEqual({ region: [], department: ["75"] });
    });

    it("rejects DTO department from another region", () => {
      expect(
        resolveTerritoryFilter(
          buildUser("region", ["11"]),
          buildDto({ department: "59" })
        )
      ).toBeNull();
    });

    it("rejects DTO department + DTO region cross-region attempt", () => {
      // user owns IDF, sends region=IDF + department=Nord (not in IDF) → reject
      expect(
        resolveTerritoryFilter(
          buildUser("region", ["11"]),
          buildDto({ region: "11", department: "59" })
        )
      ).toBeNull();
    });
  });

  describe("department role", () => {
    it("rejects when user has no territories", () => {
      expect(
        resolveTerritoryFilter(buildUser("department", []), buildDto())
      ).toBeNull();
    });

    it("forces user's department when DTO is empty", () => {
      const out = resolveTerritoryFilter(
        buildUser("department", ["75"]),
        buildDto()
      );
      expect(out).toEqual({ region: [], department: ["75"] });
    });

    it("accepts DTO department matching user", () => {
      const out = resolveTerritoryFilter(
        buildUser("department", ["75", "77"]),
        buildDto({ department: "77" })
      );
      expect(out).toEqual({ region: [], department: ["77"] });
    });

    it("rejects DTO department outside user's territory", () => {
      expect(
        resolveTerritoryFilter(
          buildUser("department", ["75"]),
          buildDto({ department: "59" })
        )
      ).toBeNull();
    });

    it("ignores DTO region for department user (forces department)", () => {
      const out = resolveTerritoryFilter(
        buildUser("department", ["75"]),
        buildDto({ region: "32" })
      );
      expect(out).toEqual({ region: [], department: ["75"] });
    });
  });
});

describe("cache-leak prevention guarantee", () => {
  // Property: for any non-national user, the resolved filter is never the
  // unrestricted {region: [], department: []} that a national user gets.
  // This guarantees the backend cache (keyed on resolved params) cannot
  // alias a national entry to a region/department user.
  it("never resolves to empty filter for region role", () => {
    const out = resolveTerritoryFilter(buildUser("region", ["11"]), buildDto());
    expect(out).not.toBeNull();
    expect(out?.region.length + out?.department.length).toBeGreaterThan(0);
  });

  it("never resolves to empty filter for department role", () => {
    const out = resolveTerritoryFilter(
      buildUser("department", ["75"]),
      buildDto()
    );
    expect(out).not.toBeNull();
    expect(out?.region.length + out?.department.length).toBeGreaterThan(0);
  });

  it("region user with 'national-shaped' DTO still gets filtered (cannot impersonate national)", () => {
    // attacker tries an empty DTO hoping to match a national cache entry
    const nationalOut = resolveTerritoryFilter(
      buildUser("national"),
      buildDto()
    );
    const regionOut = resolveTerritoryFilter(
      buildUser("region", ["11"]),
      buildDto()
    );
    expect(nationalOut).toEqual({ region: [], department: [] });
    expect(regionOut).toEqual({ region: ["11"], department: [] });
    expect(nationalOut).not.toEqual(regionOut);
  });
});

describe("checkTerritories backward-compat shim", () => {
  it("returns false when resolveTerritoryFilter returns null", () => {
    expect(
      checkTerritories(buildUser("region", ["11"]), buildDto({ region: "32" }))
    ).toBe(false);
  });

  it("returns true when filter resolves", () => {
    expect(checkTerritories(buildUser("region", ["11"]), buildDto())).toBe(
      true
    );
  });
});
