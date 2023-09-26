import { UserStructureRole } from "@domifa/common";
import { SetMetadata } from "@nestjs/common";

export const AllowUserStructureRoles = (
  ...allowUserStructureRoles: UserStructureRole[]
) => {
  return SetMetadata("allowUserStructureRoles", allowUserStructureRoles);
};
