import { SetMetadata } from "@nestjs/common";
import { UserStructureRole } from "../../_common/model";

export const AllowUserStructureRoles = (
  ...allowUserStructureRoles: UserStructureRole[]
) => {
  return SetMetadata("allowUserStructureRoles", allowUserStructureRoles);
};
