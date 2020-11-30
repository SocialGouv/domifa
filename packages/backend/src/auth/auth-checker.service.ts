import { appLogger } from "../util";
import { AppUser, UserRole } from "../_common/model";

export const authChecker = {
  checkRole,
};

function checkRole(
  user: Pick<AppUser, "_id" | "role">,
  ...expectedRoles: UserRole[]
) {
  const isValidRole = user && expectedRoles.includes(user.role);
  if (user && !isValidRole) {
    appLogger.warn(
      `[authChecker] invalid role "${user.role}" for user "${
        user._id
      }" (expected: ${expectedRoles.join(",")})"`,
      {
        sentryBreadcrumb: true,
      }
    );
    appLogger.error(`[authChecker] invalid role`);
  }
  return isValidRole;
}
