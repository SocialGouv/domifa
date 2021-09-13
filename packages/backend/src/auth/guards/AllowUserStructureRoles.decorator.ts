import { SetMetadata } from "@nestjs/common";
import { UserStructureRole } from "../../_common/model";

export const AllowUserStructureRoles = (
  ...allowUserStructureRoles: UserStructureRole[]
) => {
  if (allowUserStructureRoles.length === 0) {
    // by default: allow all
    allowUserStructureRoles = allowUserStructureRoles.concat([
      "facteur",
      "simple",
      "responsable",
      "admin",
    ]);
  }
  return SetMetadata("allowUserStructureRoles", allowUserStructureRoles);
};
