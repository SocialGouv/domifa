import { authChecker } from "./auth-checker.service";

describe("Auth Controller", () => {
  it("authChecker.checkRole ok", async () => {
    expect(
      authChecker.checkRole(
        {
          id: 1,
          role: "admin",
        },
        "admin",
        "facteur"
      )
    ).toBeTruthy();
  });

  it("authChecker.checkRole ko", async () => {
    expect(
      authChecker.checkRole(
        {
          id: 1,
          role: "admin",
        },
        "responsable",
        "facteur"
      )
    ).toBeFalsy();
  });
  it("authChecker.checkProfile ok", async () => {
    expect(
      authChecker.checkProfile(
        {
          id: 1,
          structureId: 100,
          role: "admin",
        },
        "structure"
      )
    ).toBeTruthy();
    expect(
      authChecker.checkProfile(
        {
          id: 1,
          structureId: 1,
          role: "admin",
        },
        "super-admin-domifa"
      )
    ).toBeTruthy();
  });
  it("authChecker.checkProfile admin domifa ok", async () => {
    expect(
      authChecker.checkProfile(
        {
          id: 1,
          structureId: 1,
          role: "admin",
        },
        "super-admin-domifa"
      )
    ).toBeTruthy();
  });
  it("authChecker.checkProfile admin domifa ko", async () => {
    expect(
      authChecker.checkProfile(
        {
          id: 1,
          structureId: 100,
          role: "admin",
        },
        "super-admin-domifa"
      )
    ).toBeFalsy();
  });
});
