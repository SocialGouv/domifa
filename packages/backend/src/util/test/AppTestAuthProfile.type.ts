import { UserProfile, UserStructureRole } from "../../_common/model";

export type AppTestAuthProfile = {
  profile: UserProfile;
  structureRole?: UserStructureRole;
  structureId?: number;
};
