import { appLogger } from "../util";
import { UserStructure, UserStructureRole } from "../_common/model";

export const authChecker = {
  checkRole,
};

function checkRole(
  user: Pick<UserStructure, "id" | "role">,
  ...expectedRoles: UserStructureRole[]
) {
  const isValidRole = user && expectedRoles.includes(user.role);
  if (user && !isValidRole) {
    appLogger.warn(
      `[authChecker] invalid role "${user.role}" for user "${
        user.id
      }" (expected: ${expectedRoles.join(",")})"`,
      {
        sentryBreadcrumb: true,
      }
    );
    appLogger.error(`[authChecker] invalid role`);
  }
  return isValidRole;
}
