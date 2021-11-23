import { UserProfile } from "../user/UserProfile.type";

export interface UseBaseJwtPayload<T extends UserProfile = UserProfile> {
  _userProfile: T;
  _userId: number;
  _jwtPayloadVersion: number;
  isSuperAdminDomifa: boolean;
}
