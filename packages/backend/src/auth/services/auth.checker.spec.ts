import { authChecker } from "./auth-checker.service";
import { UserStructureAuthenticated } from "../../_common/model";

describe("Auth Controller", () => {
  it("authChecker.checkRole ok", async () => {
    expect(
      authChecker.checkRole(
        {
          id: 1,
          role: "admin",
          _userId: 1,
          _userProfile: "structure",
        } as UserStructureAuthenticated,
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
          _userId: 1,
          _userProfile: "structure",
        } as UserStructureAuthenticated,
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
        },
        "structure"
      )
    ).toBeTruthy();
    expect(
      authChecker.checkProfile(
        {
          _userId: 1,
          _userProfile: "supervisor",
        },
        "supervisor"
      )
    ).toBeTruthy();
  });

  it("authChecker.checkProfile admin domifa ko", async () => {
    expect(
      authChecker.checkProfile(
        {
          _userId: 1,
          _userProfile: "structure",
        },
        "supervisor"
      )
    ).toBeFalsy();
  });
});
