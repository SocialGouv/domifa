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
          _userId: 1,
          _userProfile: "structure",
          isSuperAdminDomifa: true,
        },
        "structure"
      )
    ).toBeTruthy();
    expect(
      authChecker.checkProfile(
        {
          _userId: 1,
          _userProfile: "super-admin-domifa",
          isSuperAdminDomifa: true,
        },
        "super-admin-domifa"
      )
    ).toBeTruthy();
  });

  it("authChecker.checkProfile admin domifa ko", async () => {
    expect(
      authChecker.checkProfile(
        {
          _userId: 1,
          _userProfile: "structure",
          isSuperAdminDomifa: true,
        },
        "super-admin-domifa"
      )
    ).toBeFalsy();
  });
});
