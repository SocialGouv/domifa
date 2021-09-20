import { SetMetadata } from "@nestjs/common";
import { UserProfile } from "../../_common/model";

export const AllowUserProfiles = (...allowUserProfiles: UserProfile[]) => {
  return SetMetadata("allowUserProfiles", allowUserProfiles);
};
