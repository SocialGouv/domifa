import { domifaConfig } from "../../../../config";
import { userSecurityResetPasswordInitiator } from "../userSecurityResetPasswordInitiator.service";

describe("userSecurityResetPasswordInitiator.buildResetPasswordLink", () => {
  const userId = 42;
  const token = "some-token";

  it("sends structure users to the frontend", () => {
    const link = userSecurityResetPasswordInitiator.buildResetPasswordLink({
      userId,
      token,
      userProfile: "structure",
      userRole: "admin",
    });
    expect(link).toEqual(
      `${
        domifaConfig().apps.frontendUrl
      }users/reset-password/${userId}/${token}`
    );
  });

  it("sends super-admin-domifa to portail-admins", () => {
    const link = userSecurityResetPasswordInitiator.buildResetPasswordLink({
      userId,
      token,
      userProfile: "supervisor",
      userRole: "super-admin-domifa",
    });
    expect(link).toEqual(
      `${
        domifaConfig().apps.portailAdminUrl
      }auth/reset-password/${userId}/${token}`
    );
  });

  it.each(["national", "region", "department"] as const)(
    "sends %s supervisors to portail-stats",
    (userRole) => {
      const link = userSecurityResetPasswordInitiator.buildResetPasswordLink({
        userId,
        token,
        userProfile: "supervisor",
        userRole,
      });
      expect(link).toEqual(
        `${
          domifaConfig().apps.portailStatsUrl
        }auth/reset-password/${userId}/${token}`
      );
    }
  );
});
