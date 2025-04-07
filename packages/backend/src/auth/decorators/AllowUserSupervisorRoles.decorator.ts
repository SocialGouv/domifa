import { UserSupervisorRole } from "@domifa/common";
import { SetMetadata } from "@nestjs/common";

export const AllowUserSupervisorRoles = (
  ...allowUserSupervisorRoles: UserSupervisorRole[]
) => {
  return SetMetadata("allowUserSupervisorRoles", allowUserSupervisorRoles);
};
