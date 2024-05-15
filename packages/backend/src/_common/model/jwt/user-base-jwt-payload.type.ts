import { UserProfile } from "../user/UserProfile.type";
import { UserRightStatus } from "@domifa/common";

export interface UseBaseJwtPayload<T extends UserProfile = UserProfile> {
  _userProfile: T;
  _userId: number;
  _jwtPayloadVersion: number;
  isSuperAdminDomifa: boolean;
  userRightStatus: UserRightStatus;
  territories?: string[];
}
